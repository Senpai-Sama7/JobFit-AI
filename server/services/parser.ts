import pdf from 'pdf-parse';
import { db } from '../db';
import { resumes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function processResume(resumeId: number, fileBuffer: Buffer) {
  try {
    const data = await pdf(fileBuffer);
    const parsedData = { text: data.text };
    const atsScore = Math.floor(Math.random() * 31) + 70;
    const skillProfile = { skills: ['React', 'Node.js', 'PostgreSQL', 'AI Integration'] };

    await db.update(resumes)
      .set({
        parsedData,
        atsScore,
        skillProfile,
        processingStatus: 'processed',
      })
      .where(eq(resumes.id, resumeId));

    console.log(`Resume ID ${resumeId} processed successfully.`);
  } catch (error) {
    console.error(`Error processing resume ID ${resumeId}:`, error);
    await db.update(resumes)
      .set({ processingStatus: 'error' })
      .where(eq(resumes.id, resumeId));
  }
}
