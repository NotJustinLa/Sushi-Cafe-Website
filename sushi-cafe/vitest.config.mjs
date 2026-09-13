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
})
