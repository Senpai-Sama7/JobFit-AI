import mammoth from 'mammoth';
import { db } from '../db';
import { resumes, SkillProfile } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { extractParsedData } from './parserUtils';
import { runStructuredChat } from './openai';
import { z } from 'zod';

/**
 * Extract raw text from PDF or DOCX buffer.
 */
async function extractText(buffer: Buffer): Promise<string> {
  const sig = buffer.slice(0, 4).toString('utf8');
  if (sig === '%PDF') {
    // Dynamically import to avoid debug execution in pdf-parse index
    const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdf(buffer);
    return data.text;
  } else if (sig === 'PK\u0003\u0004') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file format for resume parsing');
}


/**
 * Process resume buffer: parse and persist structured data.
 */
/**
 * Process the uploaded resume: parse, analyze with AI for ATS score and feedback,
 * and update the database record.
 */
export async function processResume(resumeId: number, fileBuffer: Buffer, fileName: string) {
  try {
    // 1. Extract full text from resume buffer
    const text = await extractText(fileBuffer);

    // 2. Parse structured fields (contact, skills, experience, education)
    const structured = extractParsedData(text);
    const skillProfile: SkillProfile = { skills: structured.skills || [] };

    // 3. Initialize OpenAI client and analyze for ATS score and feedback
    const analysisSchema = z.object({
      atsScore: z.number().int().min(0).max(100),
      skills: z.array(z.string()).min(1),
      feedback: z.string(),
    });
    const analysis = await runStructuredChat({
      prompt: `You are an expert resume analyst. Return JSON with keys atsScore (0-100 number), skills (array of strings), and feedback (one sentence). Resume text:\n${text}`,
      schema: analysisSchema,
      timeoutMs: 25_000,
    });

    // 5. Assemble final parsed data and update record
    const parsedData = { ...structured, text, feedback: analysis.feedback };
    await db.update(resumes).set({
      parsedData,
      skillProfile: { skills: analysis.skills },
      atsScore: analysis.atsScore,
      processingStatus: 'processed',
      updatedAt: new Date(),
    }).where(eq(resumes.id, resumeId));
    console.log(`Resume ID ${resumeId} processed: ATS=${analysis.atsScore}`);
  } catch (error) {
    console.error(`Error processing resume ID ${resumeId}:`, error);
    await db.update(resumes)
      .set({ processingStatus: 'error' })
      .where(eq(resumes.id, resumeId));
  }
}
