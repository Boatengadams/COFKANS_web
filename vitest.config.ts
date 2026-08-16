import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'functions/**', 'ce/**', 'dist/**'],
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
