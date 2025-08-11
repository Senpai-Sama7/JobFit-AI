import OpenAI from 'openai';
import { getOpenAIClient } from './openai';

export interface TailoredResult {
  tailoredContent: string;
  improvements: string[];
  atsScore: number;
}

/**
 * Parse the AI response for tailored resume details.
 */
export function parseTailoringResponse(content: string): TailoredResult {
  try {
    const parsed = JSON.parse(content);
    const tailoredContent = String(parsed.tailoredContent ?? '');
    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements.map((i: unknown) => String(i))
      : [];
    const atsScore = Number(parsed.atsScore) || 0;
    return { tailoredContent, improvements, atsScore };
  } catch {
    throw new Error('Invalid AI response format');
  }
}

/**
 * Tailor a resume to a specific job description using OpenAI.
 *
 * The OpenAI key must be provided via OPENAI_API_KEY.
 */
export async function tailorResume(
  original: string,
  jobDescription: string,
  client: OpenAI = getOpenAIClient()
): Promise<TailoredResult> {
  const prompt = `You are an expert resume writer. Given the resume text and a job description, rewrite the resume so that it is tailored for the job. Also provide an ATS score (0-100) and a list of improvements. Respond in JSON with keys: tailoredContent (string), improvements (string[]), atsScore (number).\nResume: """${original}"""\nJob Description: """${jobDescription}"""`;

  const aiResponse = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const message = aiResponse.choices[0]?.message?.content || '';
  return parseTailoringResponse(message);
}
