import { z } from 'zod'

export const MAX_QTY = 20
export const MAX_LINES = 30

// What the browser is allowed to send: item ids + quantities + an optional note.
// Anything else (prices, totals, table numbers) is stripped — the server works
// those out itself from lib/menu.js and the table token.
export const orderSchema = z.object({
    items: z
        .array(
            z.object({
                id: z.string().min(1).max(100),
                qty: z.number().int().min(1).max(MAX_QTY),
            })
        )
        .min(1, 'Your cart is empty')
        .max(MAX_LINES),
    note: z.string().trim().max(200).optional(),
})
