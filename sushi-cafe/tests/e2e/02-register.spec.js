// 2 · The staff register, with three devices at once — the counter iPad
// (Tables board), the kitchen laptop (Kitchen board) and a guest's phone —
// running a whole service at the temporary test table.
import { expect, test } from '@playwright/test'
import {
    countVibrationsAndChimes, createTestTable, loginStaff, PASSCODE, removeTestTable, sendOrder, waitForSplash,
} from './helpers'

test.describe.configure({ mode: 'serial' })

let table // { tableNumber: 99, code }
let ipad, kitchen, phone
const orders = {} // order numbers, by name

// The Tables-board tile for a table number, and a kitchen ticket for an order number.
const tile = (n) => ipad.locator('main li').filter({ has: ipad.locator('span', { hasText: new RegExp(`^${n}$`) }) })
const ticket = (n) => kitchen.locator('main li').filter({ hasText: `#${n}` }).first()
const column = (title) => kitchen.locator('section').filter({ has: kitchen.getByRole('heading', { name: new RegExp(`^${title}`, 'i') }) })

test.beforeAll(async ({ browser }) => {
    table = await createTestTable()
    ipad = await (await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true })).newPage()
    const kitchenContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await countVibrationsAndChimes(kitchenContext) // count chimes instead of playing them
    kitchen = await kitchenContext.newPage()
    phone = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage()
})

test.afterAll(async () => {
    for (const page of [ipad, kitchen, phone]) await page?.context().close()
    await removeTestTable()
})

test('the register needs the staff passcode — a wrong one is rejected', async () => {
    await ipad.goto('/register')
    await expect(ipad).toHaveURL(/\/register\/login/)

    await ipad.getByLabel('Passcode').fill('0000')
    await ipad.getByRole('button', { name: 'Log in' }).click()
    await expect(ipad.getByRole('alert').filter({ hasText: 'Wrong passcode' })).toBeVisible()

    await ipad.getByLabel('Passcode').fill(PASSCODE)
    await ipad.getByRole('button', { name: 'Log in' }).click()
    await expect(ipad).toHaveURL(/\/register$/)
    await expect(ipad.getByRole('heading', { name: 'Tables' })).toBeVisible()
})

test('the Tables board opens a table when a group sits down', async () => {
    await expect(tile(table.tableNumber)).toContainText(/free/i)

    await tile(table.tableNumber).getByRole('button', { name: 'Open table' }).click()

    await expect(tile(table.tableNumber)).not.toContainText(/free/i)
    await expect(tile(table.tableNumber)).toContainText('$0.00')
})

test('a guest order appears on the kitchen board, with a chime', async () => {
    await loginStaff(kitchen, '/register/kitchen')
    await kitchen.getByRole('button', { name: 'Tap to enable sound' }).click()
    expect(await kitchen.evaluate(() => window.__tones), 'test chime (2 notes)').toBe(2)

    await phone.goto(`/t/${table.code}`)
    await waitForSplash(phone)
    orders.first = await sendOrder(phone, [0, 1]) // Handroll Small + Salmon = $175

    await expect(column('New')).toContainText(`#${orders.first}`)
    await expect(ticket(orders.first)).toContainText(new RegExp(`Table ${table.tableNumber}`, 'i'))
    await expect.poll(() => kitchen.evaluate(() => window.__tones), { message: 'new-order chime' }).toBe(4)

    // …and the counter iPad's tile picks up the order and total.
    await expect(tile(table.tableNumber)).toContainText('1 order')
    await expect(tile(table.tableNumber)).toContainText('$175.00')
})

test("the kitchen moves it along, and READY appears on the guest's phone", async () => {
    await ticket(orders.first).getByRole('button', { name: 'Start' }).click()
    await expect(column('Preparing')).toContainText(`#${orders.first}`)

    await ticket(orders.first).getByRole('button', { name: 'Ready' }).click()
    await expect(column('Ready')).toContainText(`#${orders.first}`)
    await expect(phone.getByText(/ready, we'll bring it to your table/i)).toBeVisible()
})

test('the server marks it Served from the counter iPad', async () => {
    const readyToServe = ipad.locator('section').filter({ has: ipad.getByRole('heading', { name: /ready to serve/i }) })
    await expect(readyToServe).toContainText(`#${orders.first}`)

    await readyToServe.getByRole('button', { name: 'Served' }).click()

    await expect(readyToServe).toHaveCount(0) // nothing left to carry out
    await expect(kitchen.locator('main')).not.toContainText(`#${orders.first}`)
    await expect(phone.getByText(/served, enjoy!/i)).toBeVisible()
})

test('cancelling an order takes a second tap to confirm', async () => {
    await phone.goto('/')
    await waitForSplash(phone)
    orders.cancelled = await sendOrder(phone, [3]) // Mixed $55
    await expect(ticket(orders.cancelled)).toBeVisible()

    await ticket(orders.cancelled).getByRole('button', { name: 'Cancel' }).click()
    await expect(ticket(orders.cancelled)).toContainText(`Cancel #${orders.cancelled}?`)
    await ticket(orders.cancelled).getByRole('button', { name: 'Yes, cancel' }).click()

    await expect(phone.getByText(/cancelled, please see the counter/i)).toBeVisible()
})

test('the bill warns about unserved orders, and "Paid — close table" closes the table', async () => {
    await phone.goto('/')
    await waitForSplash(phone)
    orders.unserved = await sendOrder(phone, [2]) // Deluxe $65 — still in the kitchen when they pay
    await expect(tile(table.tableNumber)).toContainText('$240.00')

    await tile(table.tableNumber).getByRole('button', { name: 'Bill' }).click()
    const bill = ipad.getByRole('dialog', { name: new RegExp(`Table ${table.tableNumber} — bill`) })
    await expect(bill).toContainText('$240.00') // $175 + $65 — the cancelled $55 isn't charged
    await expect(bill).not.toContainText(`#${orders.cancelled}`)
    await expect(bill).toContainText('1 order not served yet')

    await bill.getByRole('button', { name: 'Paid — close table' }).click()

    await expect(ipad.getByRole('status').filter({ hasText: `Table ${table.tableNumber} closed — $240.00 paid.` })).toBeVisible()
    await expect(tile(table.tableNumber)).toContainText(/free/i)
    await expect(phone.getByRole('heading', { name: 'Thanks for coming!' })).toBeVisible()
    // The order they left behind is flagged for the kitchen.
    await expect(ticket(orders.unserved)).toContainText('Table already closed')
})

test('logging out locks the register again', async () => {
    await kitchen.getByRole('button', { name: 'Log out' }).click()
    await expect(kitchen).toHaveURL(/\/register\/login/)

    await kitchen.goto('/register/kitchen')
    await expect(kitchen).toHaveURL(/\/register\/login/)
})
