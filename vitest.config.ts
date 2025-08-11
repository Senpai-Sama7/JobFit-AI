import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    include: ['server/**/*.test.ts'],
    globals: true,
    environment: 'node',
  },
});
