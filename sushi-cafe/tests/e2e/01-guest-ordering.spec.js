// 1 · The guest's journey on their phone: scan → order → watch it arrive → pay.
// The tests run in order and share one phone, like a real visit.
import { expect, test } from '@playwright/test'
import {
    countVibrationsAndChimes, createTestTable, db, openCart, removeTestTable, sendOrder, STAFF, waitForSplash,
} from './helpers'

test.describe.configure({ mode: 'serial' })

let table // the temporary test table: { tableNumber: 99, code }
let phone // the guest's phone
let orderNumber

test.beforeAll(async ({ browser }) => {
    table = await createTestTable()
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    await countVibrationsAndChimes(context)
    phone = await context.newPage()
})

test.afterAll(async () => {
    await phone?.context().close()
    await removeTestTable()
})

test('scanning the QR code before staff open the table is refused', async () => {
    await phone.goto(`/t/${table.code}`)

    await expect(phone).toHaveURL(/\/table\?reason=not_open/)
    await expect(phone.getByRole('heading', { level: 1 })).toHaveText("Your table isn't open yet")
    const cookies = await phone.context().cookies()
    expect(cookies.some((c) => c.name === 'table_token'), 'no table token is handed out').toBe(false)
})

test('once staff open the table, scanning gives the phone a 2-hour table token', async ({ request }) => {
    const opened = await request.post(`/api/register/tables/${table.tableNumber}/open`, { headers: STAFF })
    expect(opened.status()).toBe(201)

    await phone.goto(`/t/${table.code}`)

    await expect(phone).toHaveURL(/\/(\?.*)?$/) // lands on the menu
    const token = (await phone.context().cookies()).find((c) => c.name === 'table_token')
    expect(token, 'table token cookie is set').toBeTruthy()
    expect(token.httpOnly, 'page scripts cannot read the token').toBe(true)
    const hoursLeft = (token.expires * 1000 - Date.now()) / 3_600_000
    expect(hoursLeft).toBeGreaterThan(1.9)
    expect(hoursLeft).toBeLessThanOrEqual(2)
    await expect(phone.getByRole('link', { name: new RegExp(`^Table ${table.tableNumber}$`, 'i') })).toBeVisible()
})

test('the cart: add, change quantity, remove — and it survives a refresh', async () => {
    await waitForSplash(phone)
    for (const card of [0, 1, 3]) {
        await phone.locator('article').nth(card).getByRole('button', { name: /Add to cart|Added/ }).evaluate((el) => el.click())
    }
    const drawer = await openCart(phone)

    await drawer.getByRole('button', { name: 'Increase Handroll Platter' }).click() // Handroll ×2
    await drawer.getByRole('button', { name: 'Remove Mixed Sushi Platter' }).click()

    await expect(drawer).toContainText('3 items')
    await expect(drawer).toContainText('$230.00') // 2 × $55 + $120
    await phone.keyboard.press('Escape')

    await phone.reload()
    await waitForSplash(phone)
    await expect(phone.getByRole('button', { name: /^Cart/ })).toHaveText(/cart\s+3/i)
})

test('Send to kitchen saves the order, priced by the server — editing prices in the browser does nothing', async () => {
    // Try to cheat: set every price in the saved cart to 1 cent.
    await phone.evaluate(() => {
        const cart = JSON.parse(localStorage.getItem('sushi-cafe:cart'))
        for (const line of cart) line.price = 0.01
        localStorage.setItem('sushi-cafe:cart', JSON.stringify(cart))
    })
    await phone.reload()
    await waitForSplash(phone)

    orderNumber = await sendOrder(phone, [], 'No wasabi please')

    await expect(phone.getByRole('heading', { level: 1 })).toHaveText(`Table ${table.tableNumber}`)
    await expect(phone.getByText(`Order #${orderNumber} sent. It's with the kitchen.`)).toBeVisible()
    await expect(phone.getByRole('button', { name: /^Cart/ })).toHaveText(/^cart$/i) // cart emptied

    const [saved] = await db(`orders?select=table_number,total_cents,status,note,items&order_number=eq.${orderNumber}`)
    expect(saved).toMatchObject({ table_number: table.tableNumber, total_cents: 23000, status: 'received', note: 'No wasabi please' })
    expect(saved.items).toHaveLength(2)
})

test('the table page updates live as the kitchen works on the order', async ({ request }) => {
    const moveTo = async (status) => {
        const res = await request.patch(`/api/register/orders/${orderNumber}`, { headers: STAFF, data: { status } })
        expect(res.status(), `→ ${status}`).toBe(200)
    }

    await expect(phone.getByText(/sent to the kitchen/i)).toBeVisible()

    await moveTo('preparing')
    await expect(phone.getByText(/being made/i)).toBeVisible()

    await moveTo('ready')
    await expect(phone.getByText(/ready, we'll bring it to your table/i)).toBeVisible()
    await expect(phone).toHaveTitle(`READY · Order #${orderNumber}`)
    expect(await phone.evaluate(() => window.__vibrations), 'phone buzzes when it turns ready').toBe(1)

    await moveTo('served')
    await expect(phone.getByText(/served, enjoy!/i)).toBeVisible()
    expect(await phone.evaluate(() => window.__vibrations), 'and only buzzed once').toBe(1)
})

test('when the table pays and staff close it, the phone is locked out', async ({ request }) => {
    const closed = await request.post(`/api/register/tables/${table.tableNumber}/close`, { headers: STAFF })
    expect(closed.status()).toBe(200)
    expect((await closed.json()).totalCents, 'the bill').toBe(23000)

    await expect(phone.getByRole('heading', { name: 'Thanks for coming!' })).toBeVisible()

    // The phone's token hasn't expired, but the table is closed, so ordering is refused…
    const attempt = await phone.request.post('/api/orders', { data: { items: [{ id: 'mixed-sushi-platter', qty: 1 }] } })
    expect(attempt.status()).toBe(403)
    // …and scanning again is refused until staff open the table for the next group.
    await phone.goto(`/t/${table.code}`)
    await expect(phone.getByRole('heading', { level: 1 })).toHaveText("Your table isn't open yet")
})
