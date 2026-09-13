import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            // `server-only` throws unless it's imported inside Next's server
            // bundle. Tests run in plain Node, so swap in its no-op version.
            'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
        },
    },
    test: {
        // Unit tests only. The browser tests in tests/e2e run with Playwright
        // (npm run test:e2e) — both tools would otherwise pick up *.spec.js.
        include: ['lib/**/*.test.js'],
        coverage: {
            provider: 'v8',
            // skipFull: false → list every file, including the ones at 100%.
            reporter: [['text', { skipFull: false }], 'html'],
            // The pure logic that unit tests cover. The files excluded below talk
            // to the database or to Next itself, so the end-to-end tests
            // (npm run test:e2e) cover those instead.
            include: ['lib/**/*.js'],
            exclude: [
                'lib/**/*.test.js',
                'lib/orders.js',
                'lib/tables.js',
                'lib/register-auth.js',
                'lib/supabase-server.js',
                'lib/http.js',
                'lib/format.js',
            ],
        },
    },
})
