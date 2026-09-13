// Single source of truth for what's orderable and what it costs.
// The menu cards (browser) and the order API (server) both import this file,
// so the prices a guest sees are the prices the server charges. No secrets here.

// A platter is EITHER a single price ({ price })
// OR a set of size variants ({ sizes: [{ label, price }, …] }).
// The card renders a size toggle only when `sizes` is present.
// `image` points at a file in /public (served from the site root). Paths are
// case-sensitive on the deployed server, so they must match the filenames exactly.
// Prices are in whole dollars here; menuItems converts them to cents.
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

// "Handroll Platter" → "handroll-platter"
export const slug = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Stable id for a platter + optional size. Used as the cart line id AND the
// menu id, so both sides always agree:
// ("Handroll Platter", "Medium") → "handroll-platter-medium"
// ("Mixed Sushi Platter")        → "mixed-sushi-platter"
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

// Price an order from ids + quantities ONLY — never trust prices from the
// browser. Merges duplicate ids and throws on anything unknown or invalid.
// Returns the snapshot saved on the order (like a receipt) and the total.
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
