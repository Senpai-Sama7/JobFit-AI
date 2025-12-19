import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from './db';
import {
  resumes,
  roleRecommendations,
  tailoredResumes,
  type SkillProfile,
} from '../shared/schema';
import { processResume } from './services/parser';
import { tailorResume } from './services/tailoring';
import { generateRoleRecommendations } from './services/recommender';
import { runStructuredChat } from './services/openai';
import { eq, and, desc } from 'drizzle-orm';
import { jobQueue } from './services/jobQueue';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const idSchema = z.coerce.number().int().positive();
const tailorSchema = z.object({ jobDescription: z.string().min(1) });
const exportSchema = z.object({ format: z.enum(['txt', 'csv']), tailoredResumeId: z.number().int().positive().optional() });

async function withResume(
  req: Request,
  res: Response,
  handler: (resume: any, resumeId: number) => Promise<void>,
) {
  const idResult = idSchema.safeParse(req.params.id);
  if (!idResult.success) {
    res.status(400).json({ error: 'Invalid resume id' });
    return;
  }
  const resumeId = idResult.data;
  const [resume] = await db.select().from(resumes).where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.userId!)));
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }
  await handler(resume, resumeId);
}

router.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

router.get('/readyz', async (_req, res) => {
  try {
    await db.execute('select 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'degraded', error: (error as Error).message });
  }
});

router.post('/api/resumes/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file provided.' });
  }
  try {
    const simulatedS3Key = `resumes/${Date.now()}-${req.file.originalname}`;
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId: req.userId!,
        originalFileName: req.file.originalname,
        s3Key: simulatedS3Key,
        processingStatus: 'processing',
      })
      .returning();

    jobQueue
      .add(() => processResume(newResume.id, req.file!.buffer, req.file!.originalname))
      .catch((error) => console.error('Background processing failed', error));

    res.status(202).json({
      message: 'Resume upload accepted. Processing in background.',
      resumeId: newResume.id,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process resume upload.' });
  }
});

router.get('/api/resumes/:id/status', (req, res) =>
  withResume(req, res, async (resume) => {
    res.json({ status: resume.processingStatus, atsScore: resume.atsScore });
  })
);

router.post('/api/resumes/:id/optimize', (req, res) =>
  withResume(req, res, async (resume, resumeId) => {
    const text = (resume.parsedData as any)?.text || '';
    const schema = z.object({ newScore: z.number().int().min(0).max(100), improvements: z.array(z.string()).default([]) });
    const result = await runStructuredChat({
      prompt: `Optimize this resume. Return JSON: {"newScore": number 0-100, "improvements": ["bullet"]}. Resume text:\n${text}`,
      schema,
    });

    await db
      .update(resumes)
      .set({ atsScore: result.newScore, updatedAt: new Date() })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.userId!)));

    res.json({ oldScore: resume.atsScore || 0, newScore: result.newScore, improvements: result.improvements });
  })
);

router.post('/api/resumes/:id/tailor', async (req, res) => {
  const body = tailorSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid request' });
  const { jobDescription } = body.data;
  await withResume(req, res, async (resume, resumeId) => {
    const text = (resume.parsedData as any)?.text || '';
    const tailored = await tailorResume(text, jobDescription);
    const [saved] = await db
      .insert(tailoredResumes)
      .values({
        originalResumeId: resumeId,
        jobDescription,
        tailoredContent: tailored.tailoredContent,
        improvements: tailored.improvements,
        atsScore: tailored.atsScore,
      })
      .returning();

    await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, resumeId));
    res.json(saved);
  });
});

router.get('/api/resumes/:id/recommendations', (req, res) =>
  withResume(req, res, async (resume, resumeId) => {
    const skillProfile = resume.skillProfile as SkillProfile | null;
    if (!skillProfile) {
      res.status(400).json({ error: 'Resume lacks skill profile' });
      return;
    }
    const recommendations = await generateRoleRecommendations(skillProfile);
    await db.delete(roleRecommendations).where(eq(roleRecommendations.resumeId, resumeId));
    await db
      .insert(roleRecommendations)
      .values(recommendations.map((r) => ({ ...r, resumeId })));
    await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, resumeId));
    res.json(recommendations);
  })
);

router.post('/api/resumes/:id/export', async (req, res) => {
  const body = exportSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid request' });
  const { format, tailoredResumeId } = body.data;
  await withResume(req, res, async (resume, resumeId) => {
    let content = (resume.parsedData as any)?.text || '';
    let tailored;
    if (tailoredResumeId) {
      [tailored] = await db
        .select()
        .from(tailoredResumes)
        .where(and(eq(tailoredResumes.id, tailoredResumeId), eq(tailoredResumes.originalResumeId, resumeId)))
        .limit(1);
      if (!tailored) return res.status(404).json({ error: 'Tailored resume not found for this user' });
    } else {
      [tailored] = await db
        .select()
        .from(tailoredResumes)
        .where(eq(tailoredResumes.originalResumeId, resumeId))
        .orderBy(desc(tailoredResumes.createdAt))
        .limit(1);
    }
    if (tailored) {
      content = (tailored.tailoredContent as string) || content;
    }

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.txt"');
      res.send(content);
    } else if (format === 'csv') {
      const escaped = content.replace(/"/g, '""').replace(/\n/g, '\\n');
      const csv = `"resume"\n"${escaped}"`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Unsupported export format.' });
    }
  });
});

export default router;
