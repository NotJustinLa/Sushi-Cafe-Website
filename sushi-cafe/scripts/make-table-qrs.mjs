// Writes one QR code PNG per table, each pointing at <SITE_URL>/t/<code>.
//
//   npm run qr                                      → codes for SITE_URL in .env.local (your Mac, for testing)
//   SITE_URL=https://your-domain npm run qr         → codes for the live site (to print)
//
// Each address gets its own folder — qr/<host>/table-01.png … — so making test
// codes never overwrites the print-ready ones. The codes are secret (they're how
// a phone proves it's at a table), so qr/ is gitignored.
import { mkdir, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

const TEST_TABLE = 99 // the end-to-end tests' temporary table — never printed

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL } = process.env
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SITE_URL — run with: npm run qr')
    process.exit(1)
}
const site = new URL(SITE_URL)

// Plain client, not lib/supabase-server.js — that file is marked server-only
// and refuses to load outside Next.
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const { data: tables, error } = await supabase
    .from('dining_tables')
    .select('table_number, code')
    .eq('active', true)
    .neq('table_number', TEST_TABLE)
    .order('table_number')
if (error) throw error

// e.g. qr/sushi-cafe.vercel.app/  or  qr/118.139.18.186-3000/
const folder = `qr/${site.host.replace(':', '-')}/`
const outDir = new URL(`../${folder}`, import.meta.url)
await mkdir(outDir, { recursive: true })

const links = []
for (const { table_number, code } of tables) {
    const url = new URL(`/t/${code}`, site).href
    const file = `table-${String(table_number).padStart(2, '0')}.png`
    // Error correction "M" survives a smudge or scratch; the margin keeps the quiet zone scanners need.
    await writeFile(new URL(file, outDir), await QRCode.toBuffer(url, { width: 800, margin: 2, errorCorrectionLevel: 'M' }))
    console.log(`Table ${String(table_number).padStart(2)}  ${folder}${file}  ${url}`)
    links.push(`Table ${table_number}\t${file}\t${url}`)
}

// The same list as a file, so the folder says which link is on which table.
await writeFile(new URL('links.txt', outDir), `QR code links for ${site.host} — keep private\n\n${links.join('\n')}\n`)

console.log(`\n${tables.length} QR codes + links.txt written to ${folder}`)
if (site.protocol !== 'https:') {
    console.log(`Note: these point at ${site.host} over http — for testing on your own network only, not for printing.`)
}
