// Allowed status changes — received to preparing to ready to served, or
// received/preparing to cancelled at any point. A small kitchen may also
// skip straight from received to ready without preparing.
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

// Uses hasOwn because `from` comes from the database but `to` comes from a
// plain lookup would treat inherited names like "constructor" as statuses.
export function canTransition(from, to) {
    return Object.hasOwn(TRANSITIONS, from) && TRANSITIONS[from].includes(to)
}
