import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { CookieConsent } from '@/components/common/CookieConsent'

// Responsibility: shell for all public CLOBAN FINANCE pages — branded header, outlet for
// page content, and branded footer. Internal /staff/* routes are unaffected.
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-brand-text-main font-sans flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Cookie consent only renders on public routes — StaffLayout is used for /staff/* */}
      <CookieConsent />
      <PublicFooter />
    </div>
  )
}
