type JobOptions = {
  retries?: number;
  timeoutMs?: number;
  backoffMs?: number;
};

type Job<T> = {
  fn: () => Promise<T>;
  options: Required<JobOptions>;
  attempts: number;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

const DEFAULT_OPTIONS: Required<JobOptions> = {
  retries: 2,
  timeoutMs: 30_000,
  backoffMs: 500,
};

export class InMemoryJobQueue {
  private queue: Job<unknown>[] = [];
  private running = false;

  add<T>(fn: () => Promise<T>, options: JobOptions = {}): Promise<T> {
    const jobOptions = { ...DEFAULT_OPTIONS, ...options } as Required<JobOptions>;
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, options: jobOptions, attempts: 0, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length) {
      const job = this.queue.shift();
      if (!job) continue;
      try {
        const result = await this.runWithTimeout(job.fn, job.options.timeoutMs);
        job.resolve(result);
      } catch (error) {
        if (job.attempts < job.options.retries) {
          job.attempts += 1;
          await new Promise((r) => setTimeout(r, job.options.backoffMs * 2 ** (job.attempts - 1)));
          this.queue.push(job);
        } else {
          job.reject(error);
        }
      }
    }
    this.running = false;
  }

  private runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Job timed out")), timeoutMs)),
    ]);
  }
}

export const jobQueue = new InMemoryJobQueue();
