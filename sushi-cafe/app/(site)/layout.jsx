import Nav from '@/components/Nav'
import SiteShell from '@/components/SiteShell'
import CustomCursor from '@/components/CustomCursor'
import LenisProvider from '@/components/LenisProvider'
import { CartProvider } from '@/components/CartProvider'
import CartDrawer from '@/components/CartDrawer'

// The public site (/ and /table). "(site)" is a route group: the brackets keep
// it out of the URL, so these pages get this layout without /site/ in the path.
export default function SiteLayout({ children }) {
  return (
    <>
      <CustomCursor />
      <LenisProvider>
        <CartProvider>
          <SiteShell>
            <Nav />
            {children}
          </SiteShell>
          {/* Outside SiteShell so no section transform or the splash can clip it */}
          <CartDrawer />
        </CartProvider>
      </LenisProvider>
    </>
  )
}
