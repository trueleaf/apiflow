import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/offline/ai',
  testMatch: '**/*.live.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 90000,
  reporter: [['list'], ['json', { outputFile: 'playwright-report/ai-live-results.json' }]],
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  projects: [{ name: 'live-api' }],
})
