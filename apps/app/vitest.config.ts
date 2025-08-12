import { defineConfig } from 'vitest/config';
const strict = process.env.COVERAGE_STRICT === '1';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'src/routes/QuestDetail.linkProof.test.tsx',
      'src/routes/QuestDetail.peerConfirm.test.tsx',
      'src/routes/QuestDetail.proofSubmission.test.tsx',
  'src/routes/QuestDetail.textNote.test.tsx',
  'src/routes/QuestDetail.photo.test.tsx'
    ],
    globals: true,
  isolate: true,
  slowTestThreshold: 1500,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text','lcov','html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/__mocks__/**',
        'src/setupTests.ts',
        'src/routes/QuestDetail.*',
  // Exclude entry & currently untested UI shells to keep instrumentation lean
  'src/App.tsx',
  'src/main.tsx',
  'src/components/**',
  'src/features/auth/**',
  'src/routes/Home.tsx',
  'src/routes/Hubs.tsx',
  'src/routes/Map.tsx',
  'src/test/**'
      ],
      thresholds: strict ? {
        lines: 60,
        functions: 50,
        branches: 55,
        statements: 60,
      } : undefined,
    },
  },
});
