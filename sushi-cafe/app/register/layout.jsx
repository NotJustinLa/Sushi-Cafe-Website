// The staff register. Deliberately not inside app/(site) — no splash, smooth
// scroll, nav, cart or red-dot cursor — just the tools staff need.
export const metadata = {
    title: { default: 'Sushi Cafe Register', template: '%s | Sushi Cafe Register' },
    robots: { index: false, follow: false }, // keep staff pages out of search results
    manifest: '/register.webmanifest', // "Add to Home Screen" opens /register full-screen
    appleWebApp: { capable: true, title: 'Register', statusBarStyle: 'default' },
}

export default function RegisterLayout({ children }) {
    return <div className="native-cursor min-h-screen bg-bg font-body text-ink">{children}</div>
}
