import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    // Only this package's tests. tools/assetforge is a separate package with
    // its own dependencies, run via `npm --prefix tools/assetforge test`.
    include: ['src/**/*.test.ts'],
  },
});
