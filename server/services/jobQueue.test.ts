import { describe, expect, it } from 'vitest';
import { InMemoryJobQueue } from './jobQueue';

describe('InMemoryJobQueue', () => {
  it('processes jobs sequentially', async () => {
    const queue = new InMemoryJobQueue();
    const order: number[] = [];
    const results = await Promise.all([
      queue.add(async () => {
        order.push(1);
        return 'first';
      }, { timeoutMs: 1000, backoffMs: 10, retries: 0 }),
      queue.add(async () => {
        order.push(2);
        return 'second';
      }, { timeoutMs: 1000, backoffMs: 10, retries: 0 }),
    ]);

    expect(order).toEqual([1, 2]);
    expect(results).toEqual(['first', 'second']);
  });

  it('retries failing jobs before rejecting', async () => {
    const queue = new InMemoryJobQueue();
    let attempts = 0;
    await expect(
      queue.add(
        async () => {
          attempts += 1;
          if (attempts < 2) {
            throw new Error('fail once');
          }
          return 'ok';
        },
        { retries: 2, timeoutMs: 500, backoffMs: 5 },
      ),
    ).resolves.toBe('ok');
    expect(attempts).toBe(2);
  });
});
