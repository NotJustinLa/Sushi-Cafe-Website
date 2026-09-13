// Writes one QR code PNG per table into qr/, each pointing at /t/<code>.
//
//   npm run qr
//
// SITE_URL (in .env.local) decides where the codes point: your dev server's
// Network URL while testing on a phone, the real domain before printing.
// The codes are secret (they're how a phone proves it's at a table), so qr/ is gitignored.
import { mkdir, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL } = process.env
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SITE_URL — run with: npm run qr')
    process.exit(1)
}

// Plain client, not lib/supabase-server.js — that file is marked server-only
// and refuses to load outside Next.
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const { data: tables, error } = await supabase
    .from('dining_tables')
    .select('table_number, code')
    .eq('active', true)
    .order('table_number')
if (error) throw error

const outDir = new URL('../qr/', import.meta.url)
await mkdir(outDir, { recursive: true })

for (const { table_number, code } of tables) {
    const url = new URL(`/t/${code}`, SITE_URL).href
    const file = `table-${String(table_number).padStart(2, '0')}.png`
    // Error correction "M" survives a smudge or scratch; the margin keeps the quiet zone scanners need.
    await writeFile(new URL(file, outDir), await QRCode.toBuffer(url, { width: 800, margin: 2, errorCorrectionLevel: 'M' }))
    console.log(`Table ${String(table_number).padStart(2)}  qr/${file}  ${url}`)
}

console.log(`\n${tables.length} QR codes written to qr/`)
