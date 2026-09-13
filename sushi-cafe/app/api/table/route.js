import { json } from '@/lib/http'
import { getTableStatus } from '@/lib/tables'

// Which table is this phone at, can it order, and what has the table ordered?
// The cart drawer, the nav and the /table page (every 5s) call this.
export async function GET() {
    return json(await getTableStatus())
}
