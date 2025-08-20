import OpenAI from 'openai';
import { SkillProfile } from '../../shared/schema';
import { getOpenAIClient } from './openai';

export interface Recommendation {
  jobTitle: string;
  companyName: string;
  fitScore: number;
  description: string;
  source: string;
}

/**
 * Parse AI output into an array of recommendations.
 */
export function parseRecommendations(content: string): Recommendation[] {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed.map((r) => ({
      jobTitle: String(r.jobTitle ?? '').trim(),
      companyName: String(r.companyName ?? '').trim(),
      fitScore: Math.min(100, Math.max(0, Number(r.fitScore) || 0)),
      description: String(r.description ?? '').trim(),
      source: String(r.source ?? 'ai').trim(),
    }));
  } catch {
    throw new Error('Invalid AI response format');
  }
}

/**
 * Generate job role recommendations from a resume's skill profile.
 */
export async function generateRoleRecommendations(
  skills: SkillProfile,
  client: OpenAI = getOpenAIClient()
): Promise<Recommendation[]> {
  const skillList = skills.skills.join(', ');
  const prompt = `Given the following skills: ${skillList}. Suggest up to three job roles that would suit this candidate. Respond with a JSON array where each item has jobTitle, companyName, fitScore (0-100), description, source.`;

  const aiResponse = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const message = aiResponse.choices[0]?.message?.content || '';
  return parseRecommendations(message);
}
