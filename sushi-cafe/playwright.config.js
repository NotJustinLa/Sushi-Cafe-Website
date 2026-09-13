import { defineConfig } from '@playwright/test'

// The tests use the same Supabase project and secrets as `npm run dev`
// (to open a table, read back saved orders, and clean up afterwards).
try {
    process.loadEnvFile('.env.local')
} catch {
    // No .env.local (e.g. CI) — the variables must already be set.
}

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
    testDir: './tests/e2e',
    // The tests share one database and use a real table, so run them one at a time, in order.
    fullyParallel: false,
    workers: 1,
    timeout: 90_000,
    // Pages poll every 3–5 seconds, so give expectations time to catch up.
    expect: { timeout: 12_000 },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: BASE_URL,
        // Uses your installed Google Chrome, so there's no browser download.
        // Without Chrome: run `npx playwright install chromium` and set E2E_CHANNEL=chromium.
        channel: process.env.E2E_CHANNEL ?? 'chrome',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    // Starts `npm run dev` if it isn't already running (and reuses it if it is).
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : { command: 'npm run dev', url: `${BASE_URL}/register/login`, reuseExistingServer: true, timeout: 120_000 },
})
