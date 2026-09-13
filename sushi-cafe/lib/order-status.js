// Which status changes are allowed (§4 of the plan):
//
//   received ──▶ preparing ──▶ ready ──▶ served
//       │            │
//       └────────────┴──▶ cancelled
//   received ──▶ ready   (a small kitchen may skip "preparing")
export const TRANSITIONS = {
    received: ['preparing', 'ready', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served'],
    served: [],
    cancelled: [],
}

export const ORDER_STATUSES = Object.keys(TRANSITIONS)

// Orders the kitchen still has to deal with.
export const ACTIVE_STATUSES = ['received', 'preparing', 'ready']

// hasOwn: `from` comes from the database but `to` from a request body, and a
// plain lookup would treat inherited names like "constructor" as statuses.
export function canTransition(from, to) {
    return Object.hasOwn(TRANSITIONS, from) && TRANSITIONS[from].includes(to)
}
