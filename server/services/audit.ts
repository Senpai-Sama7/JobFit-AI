import { db } from '../db';
import { activities } from '../../shared/schema';

type ActivityPayload = {
  userId: number;
  type: string;
  title: string;
  description?: string;
  metadata?: unknown;
};

function sanitizeMetadata(metadata: unknown) {
  if (metadata === undefined || metadata === null) return metadata;
  if (typeof metadata === 'string' && metadata.length > 10_000) {
    return `${metadata.slice(0, 9_900)}…`;
  }
  return metadata;
}

export async function recordActivity(payload: ActivityPayload) {
  const metadata = sanitizeMetadata(payload.metadata);
  await db.insert(activities)
    .values({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      metadata,
    })
    .returning();
}

