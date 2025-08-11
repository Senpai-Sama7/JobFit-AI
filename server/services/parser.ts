import mammoth from 'mammoth';
import { db } from '../db';
import { resumes, SkillProfile } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { extractParsedData } from './parserUtils';
import { Configuration, OpenAIApi } from 'openai';

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
 * Extract structured fields from resume text.
 */
export function extractParsedData(text: string): ParsedResume {
  const parsed: ParsedResume = {};
  // Contact info
  const contactBlock = text.split(/PROFESSIONAL SUMMARY/i)[0];
  parsed.contact = {
    name: contactBlock.split(/\r?\n/).find(line => line.trim() !== '') || '',
    email: (contactBlock.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [''])[0],
    phone: (contactBlock.match(/(?:\+?\d[\d\s-.()]{7,}\d)/) || [''])[0],
    location: (contactBlock.match(/Location:\s*(.*)/i) || ['', ''])[1].trim(),
    linkedin: (contactBlock.match(/LinkedIn:\s*(.*)/i) || ['', ''])[1].trim(),
    website: (contactBlock.match(/Website:\s*(.*)/i) || ['', ''])[1].trim(),
  };

  // Skills
  const skillsMatch = text.match(/TECHNICAL SKILLS([\s\S]*?)\n\n/i);
  const skills: string[] = [];
  if (skillsMatch) {
    skillsMatch[1]
      .split(/\r?\n/)
      .forEach(line => {
        const parts = line.split(':')[1];
        if (parts) {
          parts.split(/,\s*/).forEach(skill => {
            const s = skill.trim();
            if (s) skills.push(s);
          });
        }
      });
  }
  parsed.skills = skills;

  // Experience
  const expMatch = text.match(/PROFESSIONAL EXPERIENCE([\s\S]*?)\nEDUCATION/i);
  parsed.experience = [];
  if (expMatch) {
    const lines = expMatch[1].trim().split(/\r?\n/);
    let current: any = null;
    lines.forEach(line => {
      const headerMatch = line.match(/^(.*)\|(.+)\|(.*)$/);
      if (headerMatch) {
        if (current) parsed.experience.push(current);
        const [_, title, company, dates] = headerMatch;
        const [start, end] = dates.split('-').map(s => s.trim());
        current = { title: title.trim(), company: company.trim(), startDate: start, endDate: end, details: [] };
      } else if (line.startsWith('•') && current) {
        current.details.push(line.replace(/^•\s*/, '').trim());
      }
    });
    if (current) parsed.experience.push(current);
  }

  // Education
  const eduMatch = text.match(/EDUCATION([\s\S]*?)(?:\n[A-Z ]{3,}\n|$)/i);
  parsed.education = [];
  if (eduMatch) {
    eduMatch[1]
      .trim()
      .split(/\r?\n/)
      .forEach(line => {
        const l = line.trim();
        if (l) parsed.education.push(l);
      });
  }

  return parsed;
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
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const prompt = `You are an expert resume analyst. Evaluate the following resume and do three things:
1. Rate its ATS compatibility on a scale of 0 to 100.
2. List the top 5 technical or professional skills evident in the resume.
3. Provide one sentence of constructive feedback to improve ATS compatibility.
Resume Text:
"""${text}"""`;
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const reply = aiResponse.data.choices[0]?.message?.content || '';

    // 4. Parse AI response for score, skills, and feedback
    let atsScore: number | null = null;
    const feedbackLines = reply.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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
