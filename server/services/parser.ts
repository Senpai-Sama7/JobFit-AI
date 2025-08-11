import mammoth from 'mammoth';
import { db } from '../db';
import { resumes, SkillProfile } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { extractParsedData } from './parserUtils';
import { getOpenAIClient } from './openai';

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
    const openai = getOpenAIClient();
    const prompt = `You are an expert resume analyst. Evaluate the following resume and do three things:
1. Rate its ATS compatibility on a scale of 0 to 100.
2. List the top 5 technical or professional skills evident in the resume.
3. Provide one sentence of constructive feedback to improve ATS compatibility.
Resume Text:
"""${text}"""`;
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const reply = aiResponse.choices[0]?.message?.content || '';

    // 4. Parse AI response for score, skills, and feedback
    let atsScore: number | null = null;
    const feedbackLines = reply.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const feedback: string[] = [];
    const aiSkills: string[] = [];
    for (const line of feedbackLines) {
      const scoreMatch = line.match(/(\d+)\s*\/\s*100/);
      if (scoreMatch && atsScore === null) {
        atsScore = parseInt(scoreMatch[1], 10);
        continue;
      }
      if (/^-/.test(line) || /^\d+\./.test(line)) {
        aiSkills.push(line.replace(/^\W+/, ''));
        continue;
      }
      if (!feedback.length && /\.$/.test(line)) {
        feedback.push(line);
      }
    }
    if (atsScore === null) atsScore = 80;
    if (!aiSkills.length) aiSkills.push('N/A');

    // 5. Assemble final parsed data and update record
    const parsedData = { ...structured, text, feedback: feedback[0] || null };
    await db.update(resumes).set({
      parsedData,
      skillProfile: { skills: aiSkills },
      atsScore,
      processingStatus: 'processed',
      updatedAt: new Date(),
    }).where(eq(resumes.id, resumeId));
    console.log(`Resume ID ${resumeId} processed: ATS=${atsScore}`);
  } catch (error) {
    console.error(`Error processing resume ID ${resumeId}:`, error);
    await db.update(resumes)
      .set({ processingStatus: 'error' })
      .where(eq(resumes.id, resumeId));
  }
}
