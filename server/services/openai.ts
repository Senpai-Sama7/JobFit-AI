import OpenAI from 'openai';
import { z } from 'zod';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function runStructuredChat<T>(params: {
  prompt: string;
  schema: z.ZodType<T>;
  timeoutMs?: number;
}): Promise<T> {
  const client = getOpenAIClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 25_000);
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: params.prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      signal: controller.signal,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    const parsed = JSON.parse(content);
    return params.schema.parse(parsed);
  } finally {
    clearTimeout(timeout);
  }
}

export default getOpenAIClient;
