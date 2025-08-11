import { Router } from 'express';
import multer from 'multer';
import { db } from './db';
import { resumes } from '../shared/schema';
import { processResume } from './services/parser';
import { eq } from 'drizzle-orm';

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

export default router;
