import { Router } from 'express';
import multer from 'multer';
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
import { getOpenAIClient } from './services/openai';
import { eq, desc } from 'drizzle-orm';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
        originalFileName: req.file.originalname,
        s3Key: simulatedS3Key,
        processingStatus: 'processing',
      })
      .returning();

    processResume(newResume.id, req.file.buffer, req.file.originalname);

    res.status(202).json({
      message: 'Resume upload accepted. Processing in background.',
      resumeId: newResume.id,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process resume upload.' });
  }
});

router.get('/api/resumes/:id/status', async (req, res) => {
  const resumeId = parseInt(req.params.id, 10);
  if (isNaN(resumeId)) {
    return res.status(400).json({ error: 'Invalid resume id' });
  }
  try {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ status: resume.processingStatus, atsScore: resume.atsScore });
  } catch (error) {
    console.error('Status Error:', error);
    res.status(500).json({ error: 'Failed to fetch status.' });
  }
});

router.post('/api/resumes/:id/optimize', async (req, res) => {
  const resumeId = parseInt(req.params.id, 10);
  if (isNaN(resumeId)) {
    return res.status(400).json({ error: 'Invalid resume id' });
  }
  try {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const originalScore = resume.atsScore || 0;
    const text = (resume.parsedData as any)?.text || '';

    const openai = getOpenAIClient();
    const prompt = `Improve the following resume and provide an ATS score between 0 and 100 followed by improvements as bullet points. Resume:\n${text}`;
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const reply = aiResponse.choices[0]?.message?.content || '';
    const lines = reply.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    let newScore = originalScore;
    const improvements: string[] = [];
    for (const line of lines) {
      const scoreMatch = line.match(/(\d+)\s*\/\s*100/);
      if (scoreMatch) {
        newScore = parseInt(scoreMatch[1], 10);
      } else if (line.startsWith('-')) {
        improvements.push(line.replace(/^[-*]\s*/, ''));
      }
    }

    await db.update(resumes).set({ atsScore: newScore }).where(eq(resumes.id, resumeId));

    res.json({ oldScore: originalScore, newScore, improvements });
  } catch (error) {
    console.error('Optimize Error:', error);
    res.status(500).json({ error: 'Failed to optimize resume.' });
  }
});

router.post('/api/resumes/:id/tailor', async (req, res) => {
  const resumeId = parseInt(req.params.id, 10);
  const { jobDescription } = req.body as { jobDescription?: string };
  if (isNaN(resumeId) || !jobDescription) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

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

    res.json(saved);
  } catch (error) {
    console.error('Tailor Error:', error);
    res.status(500).json({ error: 'Failed to tailor resume.' });
  }
});

router.get('/api/resumes/:id/recommendations', async (req, res) => {
  const resumeId = parseInt(req.params.id, 10);
  if (isNaN(resumeId)) {
    return res.status(400).json({ error: 'Invalid resume id' });
  }
  try {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const skillProfile = resume.skillProfile as SkillProfile | null;
    if (!skillProfile) {
      return res.status(400).json({ error: 'Resume lacks skill profile' });
    }
    const recommendations = await generateRoleRecommendations(skillProfile);
    await db
      .insert(roleRecommendations)
      .values(recommendations.map((r) => ({ ...r, resumeId })));
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

router.post('/api/resumes/:id/export', async (req, res) => {
  const resumeId = parseInt(req.params.id, 10);
  const { format } = req.body as { format?: string };
  if (isNaN(resumeId) || !format) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    let content = (resume.parsedData as any)?.text || '';
    const [tailored] = await db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.originalResumeId, resumeId))
      .orderBy(desc(tailoredResumes.createdAt))
      .limit(1);
    if (tailored) {
      content = (tailored.tailoredContent as string) || content;
    }

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.txt"');
      res.send(content);
    } else if (format === 'csv') {
      const csv = `"resume"\n"${content.replace(/"/g, '""')}"`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Unsupported export format.' });
    }
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export resume.' });
  }
});

export default router;
