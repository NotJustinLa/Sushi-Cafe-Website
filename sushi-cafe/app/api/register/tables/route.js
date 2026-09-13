import { json } from '@/lib/http'
import { requireRegister } from '@/lib/register-auth'
import { listTables } from '@/lib/tables'

// Staff: every table and whether it's open. (Order counts + running totals come in M5.)
export async function GET(request) {
    const denied = requireRegister(request)
    if (denied) return denied

    return json({ tables: await listTables() })
}
