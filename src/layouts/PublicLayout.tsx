import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'

// Responsibility: shell for all public CLOBAN FINANCE pages — branded header, outlet for
// page content, and branded footer. Internal /staff/* routes are unaffected.
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-brand-text-main font-sans flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
