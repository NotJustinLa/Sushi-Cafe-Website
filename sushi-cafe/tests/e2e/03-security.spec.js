// 3 · Security: what the server refuses, tried the way an attacker would —
// straight at the API, no browser UI. Fast (a few seconds).
import { expect, test } from '@playwright/test'
import { BASE_URL, createTestTable, db, removeTestTable, STAFF } from './helpers'

test.describe.configure({ mode: 'serial' })

let table // { tableNumber: 99, code }
let guest // an API client with its own cookie jar, like a phone's browser

test.beforeAll(async ({ playwright }) => {
    table = await createTestTable()
    guest = await playwright.request.newContext({ baseURL: BASE_URL })
})

test.afterAll(async () => {
    await guest?.dispose()
    await removeTestTable()
})

const order = (items, extra = {}) => guest.post('/api/orders', { data: { items, ...extra } })

test.describe('staff register', () => {
    test('the register API refuses anyone without the key or a staff login', async ({ request }) => {
        const attempts = {
            'no credentials': {},
            'wrong key': { Authorization: 'Bearer not-the-key' },
            'forged staff cookie': { Cookie: 'staff_session=eyJyb2xlIjoic3RhZmYifQ.forged' },
        }
        for (const [label, headers] of Object.entries(attempts)) {
            expect((await request.get('/api/register/tables', { headers })).status(), label).toBe(401)
            expect((await request.get('/api/register/orders', { headers })).status(), label).toBe(401)
            expect((await request.post('/api/register/tables/1/open', { headers })).status(), label).toBe(401)
        }
    })

    test('register pages send anyone who is not logged in to the login page', async ({ request }) => {
        for (const path of ['/register', '/register/kitchen']) {
            const res = await request.get(path, { maxRedirects: 0 })
            expect(res.status(), path).toBe(307)
            expect(res.headers().location, path).toContain('/register/login')
        }
    })

    test('a wrong passcode is rejected — and slowed down, to make guessing slow', async ({ request }) => {
        const started = Date.now()
        const res = await request.post('/api/register/login', { data: { passcode: '9999' } })
        expect(res.status()).toBe(401)
        expect(Date.now() - started, 'answer takes at least 1 second').toBeGreaterThanOrEqual(1000)
    })
})

test.describe('guest ordering', () => {
    test('nobody can order without scanning a table QR code', async () => {
        expect((await order([{ id: 'mixed-sushi-platter', qty: 1 }])).status()).toBe(401)
    })

    test('a made-up or edited table token is rejected', async ({ request }) => {
        const forged = Buffer.from(JSON.stringify({ sid: 'x', tbl: table.tableNumber, exp: Date.now() + 9e9 })).toString('base64url')
        const res = await request.post('/api/orders', {
            headers: { Cookie: `table_token=${forged}.not-a-real-signature` },
            data: { items: [{ id: 'mixed-sushi-platter', qty: 1 }] },
        })
        expect(res.status()).toBe(401)
    })

    test('an unknown QR code is refused', async () => {
        const res = await guest.get('/t/000000000000', { maxRedirects: 0 })
        expect(res.headers().location).toContain('reason=bad_code')
    })

    test('the server ignores prices, totals and table numbers sent by the browser', async ({ request }) => {
        expect((await request.post(`/api/register/tables/${table.tableNumber}/open`, { headers: STAFF })).status()).toBe(201)
        await guest.get(`/t/${table.code}`, { maxRedirects: 0 }) // "scan" → table token cookie

        const res = await order([{ id: 'mixed-sushi-platter', qty: 1, price: 0.01 }], { totalCents: 1, tableNumber: 3 })
        expect(res.status()).toBe(201)

        const [saved] = await db(`orders?select=table_number,total_cents&order_number=eq.${(await res.json()).orderNumber}`)
        expect(saved).toEqual({ table_number: table.tableNumber, total_cents: 5500 }) // real price, real table
    })

    test('invalid orders are rejected', async () => {
        const cases = {
            'quantity 0': [{ id: 'mixed-sushi-platter', qty: 0 }],
            'quantity 21': [{ id: 'mixed-sushi-platter', qty: 21 }],
            'two lines adding up past 20': [{ id: 'mixed-sushi-platter', qty: 15 }, { id: 'mixed-sushi-platter', qty: 10 }],
            'item not on the menu': [{ id: 'free-sushi', qty: 1 }],
            'empty cart': [],
        }
        for (const [label, items] of Object.entries(cases)) {
            expect((await order(items)).status(), label).toBe(400)
        }
        const notJson = await guest.post('/api/orders', { headers: { 'Content-Type': 'application/json' }, data: 'hello' })
        expect(notJson.status(), 'body that is not JSON').toBe(400)
    })

    test('order statuses only move forward', async ({ request }) => {
        const { orderNumber } = await (await order([{ id: 'deluxe-platter-for-two', qty: 1 }])).json()
        const move = (status, n = orderNumber) => request.patch(`/api/register/orders/${n}`, { headers: STAFF, data: { status } })

        expect((await move('served')).status(), 'received → served skips the kitchen').toBe(409)
        expect((await move('eaten')).status(), 'not a status').toBe(400)
        expect((await move('ready', 99999999)).status(), 'no such order').toBe(404)
        expect((await move('ready')).status(), 'received → ready').toBe(200)
        expect((await move('preparing')).status(), 'ready → preparing goes backwards').toBe(409)
        expect((await move('cancelled')).status(), 'ready food cannot be cancelled').toBe(409)
    })

    test('a closed table cannot order, even with an unexpired token', async ({ request }) => {
        expect((await request.post(`/api/register/tables/${table.tableNumber}/close`, { headers: STAFF })).status()).toBe(200)
        expect((await order([{ id: 'mixed-sushi-platter', qty: 1 }])).status()).toBe(403)
    })
})
