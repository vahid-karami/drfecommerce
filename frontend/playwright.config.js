import { defineConfig, devices } from '@playwright/test';

// Browser tests live in e2e/ (vitest keeps src/). Run: npm run e2e
// Starts the Vite dev server itself, or reuses one already running on :5173.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173', locale: 'fa-IR' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
