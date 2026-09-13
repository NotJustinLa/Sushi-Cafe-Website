import { redirect } from 'next/navigation'
import RegisterHeader from '@/components/register/RegisterHeader'
import { hasStaffSession } from '@/lib/staff-session'

// Every logged-in register page (the Tables board and the Kitchen board).
// proxy.js already bounced anyone with no cookie at all; this is the real
// check that the cookie is genuine and hasn't expired.
export default async function StaffLayout({ children }) {
    if (!(await hasStaffSession())) redirect('/register/login')

    return (
        <>
            <RegisterHeader />
            {children}
        </>
    )
}
