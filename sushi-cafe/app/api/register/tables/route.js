import { json } from '@/lib/http'
import { requireRegister } from '@/lib/register-auth'
import { listTables } from '@/lib/tables'

// Staff: every table, whether it's open, and each open table's order count + running total.
export async function GET(request) {
    const denied = await requireRegister(request)
    if (denied) return denied

    return json({ tables: await listTables() })
}
