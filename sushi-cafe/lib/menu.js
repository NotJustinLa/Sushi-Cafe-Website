// Single source of truth for what's orderable and what it costs.
// Both the menu cards and the order API import this file, so a guest's
// displayed price always matches what the server charges.

// A platter has either a flat price or a list of size variants (label + price).
// The card shows a size toggle only when sizes are present.
// `image` paths live under /public and are case-sensitive in production.
// Prices are written in dollars here. menuItems converts them to cents.
export const platters = [
    {
        name: 'Handroll Platter',
        image: '/Handroll_Platter.JPG',
        description: '48 pieces of assorted handrolls',
        sizes: [
            { label: 'Small', price: 55 },
            { label: 'Medium', price: 67 },
            { label: 'Large', price: 80 },
        ],
    },
    {
        name: 'Salmon Sashimi Platter',
        image: '/Sashimi_Platter.JPG',
        description: '52 slices of fresh salmon',
        price: 120,
    },
    {
        name: 'Deluxe Platter for Two',
        image: '/Deluxe_Platter_for_Two.JPG',
        description: '34 pieces of sushi, rolls & sashimi to share',
        price: 65,
    },
    {
        name: 'Mixed Sushi Platter',
        image: '/Mixed_Sushi_Platter.JPG',
        description: '26 pieces',
        price: 55,
    },
    {
        name: 'Assorted Sushi Platter',
        image: '/Assorted_Sushi_Platter.JPG',
        description: '42 pieces',
        price: 78,
    },
    {
        name: 'Sushi & Sashimi Platter',
        image: '/Sushi_and_Sashimi_Platter.JPG',
        description: '64 pieces',
        price: 120,
    },
]

// e.g. "Handroll Platter" becomes "handroll-platter"
export const slug = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Stable id for a platter plus optional size, used as both the cart line id
// and the menu id so the two always match.
// e.g. ("Handroll Platter", "Medium") becomes "handroll-platter-medium"
export function itemId(name, sizeLabel) {
    return sizeLabel ? `${slug(name)}-${slug(sizeLabel)}` : slug(name)
}

const toCents = (dollars) => Math.round(dollars * 100)

// Everything orderable, flattened to one entry per size.
export const menuItems = platters.flatMap((p) =>
    p.sizes
        ? p.sizes.map((s) => ({
              id: itemId(p.name, s.label),
              name: p.name,
              variant: s.label,
              priceCents: toCents(s.price),
          }))
        : [{ id: itemId(p.name), name: p.name, variant: null, priceCents: toCents(p.price) }]
)

const byId = new Map(menuItems.map((item) => [item.id, item]))

export function findMenuItem(id) {
    return byId.get(id) ?? null
}

// Prices an order from ids and quantities only, never trusting the browser.
// Merges duplicate ids and throws on anything unknown or invalid.
export function priceOrder(lines) {
    const qtyById = new Map()
    for (const { id, qty } of lines) {
        if (!byId.has(id)) throw new Error(`Unknown menu item: ${id}`)
        if (!Number.isInteger(qty) || qty < 1) throw new Error(`Invalid quantity for ${id}: ${qty}`)
        qtyById.set(id, (qtyById.get(id) ?? 0) + qty)
    }

    const items = [...qtyById].map(([id, qty]) => {
        const { name, variant, priceCents } = byId.get(id)
        return { id, name, variant, unitCents: priceCents, qty }
    })
    const totalCents = items.reduce((sum, line) => sum + line.unitCents * line.qty, 0)

    return { items, totalCents }
}
