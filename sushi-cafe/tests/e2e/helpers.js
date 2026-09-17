// Shared helpers for the end-to-end tests.
//
// The tests drive the real site in real Chrome against the real Supabase
// database (the same one `npm run dev` uses). To stay out of the way they
// never touch the cafe's real tables — each test file creates a temporary
// TABLE 99 (with its own secret QR code) and deletes it — with every session
// and order on it — when it finishes. So don't use 99 as a real table number.
import { expect } from '@playwright/test'

const {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
    REGISTER_API_KEY,
    STAFF_PASSCODE,
} = process.env

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
export const PASSCODE = STAFF_PASSCODE
// The register's API key, for tests that act as the register without its UI.
export const STAFF = { Authorization: `Bearer ${REGISTER_API_KEY}` }

// ── Database (setup, checks, cleanup) ─────────────────────────────────

// Read/write Supabase directly with the service key. Test code only —
// this key never goes near a page.
export async function db(path, init = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...init,
        headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init.headers },
    })
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
    return res.json()
}

export const TEST_TABLE = 99

// Create the temporary test table (removing any left over from a crashed run).
// Returns the test table's number (99) and its code — what its QR code would contain.
export async function createTestTable() {
    await removeTestTable()
    const [row] = await db('dining_tables', { method: 'POST', body: JSON.stringify({ table_number: TEST_TABLE }) })
    return { tableNumber: TEST_TABLE, code: row.code }
}

// Delete the test table and everything that happened at it.
export async function removeTestTable() {
    const sessions = await db(`table_sessions?select=id&table_number=eq.${TEST_TABLE}`)
    if (sessions.length) {
        const ids = sessions.map((s) => s.id).join(',')
        await db(`orders?session_id=in.(${ids})`, { method: 'DELETE' })
        await db(`table_sessions?id=in.(${ids})`, { method: 'DELETE' })
    }
    await db(`dining_tables?table_number=eq.${TEST_TABLE}`, { method: 'DELETE' })
}

// ── Browser ───────────────────────────────────────────────────────────

// Replace the phone's vibration and the kitchen's chime with counters, so tests
// can check "vibrated once" / "chimed" without a real buzz or sound.
export async function countVibrationsAndChimes(context) {
    await context.addInitScript(() => {
        window.__vibrations = 0
        window.__tones = 0
        Object.defineProperty(Navigator.prototype, 'vibrate', {
            configurable: true,
            value() { window.__vibrations++; return true },
        })
        window.AudioContext = class {
            constructor() { this.currentTime = 0; this.destination = {} }
            resume() { return Promise.resolve() }
            createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (n) => n } }
            createOscillator() { return { frequency: {}, connect: (n) => n, start() { window.__tones++ }, stop() {} } }
        }
    })
}

// The public site shows a ~2 second loading splash on each full page load.
export async function waitForSplash(page) {
    await expect(page.locator('[class*="z-[1000]"]')).toHaveCount(0, { timeout: 10_000 })
}

// Tap "Add to cart" on the platter card at `index` (0 = Handroll, 1 = Salmon,
// 2 = Deluxe, 3 = Mixed…). The cards sit in a scroll-driven strip, so click via the DOM.
export async function addPlatter(page, index) {
    await page.locator('article').nth(index).getByRole('button', { name: /Add to cart|Added/ }).evaluate((el) => el.click())
}

export async function openCart(page) {
    await page.getByRole('button', { name: /^Cart/ }).click()
    const drawer = page.getByRole('dialog', { name: 'Your cart' })
    await expect(drawer).toBeVisible()
    return drawer
}

// Add the given platters, open the cart, and Send to kitchen. Returns the order number.
export async function sendOrder(page, cardIndexes = [], note) {
    for (const i of cardIndexes) await addPlatter(page, i)
    const drawer = await openCart(page)
    await expect(drawer.getByText(/Ordering for/i)).toBeVisible()
    if (note) await drawer.getByPlaceholder('Note for the kitchen (optional)').fill(note)
    await drawer.getByRole('button', { name: /Send to kitchen/ }).click()
    await page.waitForURL(/\/table\?sent=\d+/)
    return Number(new URL(page.url()).searchParams.get('sent'))
}

// Log in to the register and land on `path` (/register or /register/kitchen).
export async function loginStaff(page, path = '/register') {
    await page.goto(path)
    await expect(page).toHaveURL(/\/register\/login/)
    await page.getByLabel('Passcode').fill(PASSCODE)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
}
