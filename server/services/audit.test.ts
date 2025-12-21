import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordActivity } from './audit';
import { activities } from '../../shared/schema';
import { db } from '../db';

vi.mock('../db', () => ({
  db: {
    insert: vi.fn(),
  },
}));

const values = vi.fn();
const returning = vi.fn();

describe('recordActivity', () => {
  beforeEach(() => {
    values.mockReset();
    returning.mockReset();
    (db.insert as unknown as vi.Mock).mockReturnValue({ values, returning });
    values.mockReturnValue({ returning });
    returning.mockResolvedValue([{ id: 1 }]);
  });

  it('persists activity with provided fields', async () => {
    await recordActivity({
      userId: 10,
      type: 'download',
      title: 'Resume export',
      metadata: { resumeId: 5, format: 'csv' },
    });

    expect(db.insert).toHaveBeenCalledWith(activities);
    expect(values).toHaveBeenCalledWith({
      userId: 10,
      type: 'download',
      title: 'Resume export',
      description: undefined,
      metadata: { resumeId: 5, format: 'csv' },
    });
    expect(returning).toHaveBeenCalled();
  });

  it('truncates overly long string metadata', async () => {
    const longMeta = 'a'.repeat(20_000);
    await recordActivity({
      userId: 2,
      type: 'download',
      title: 'Resume export',
      metadata: longMeta,
    });

    const saved = values.mock.calls[0]?.[0]?.metadata as string;
    expect(saved.length).toBeLessThan(longMeta.length);
    expect(saved.endsWith('…')).toBe(true);
  });
});

