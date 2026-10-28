import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/Button'
import { STAFF_NAV } from '@/app/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { env } from '@/lib/env'

// Responsibility: sidebar + top bar shell for the staff portal. Links are filtered by role for convenience only.
export function StaffLayout() {
  const auth = useAuth()
  const items = STAFF_NAV.filter((i) => auth.hasRole(i.roles))
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="bg-navy-950 text-white md:w-60 md:shrink-0">
        <div className="px-4 py-4">
          <p className="text-lg font-semibold">{env.appName}</p>
          <p className="text-xs text-slate-300">{auth.activeOrg?.orgName}</p>
        </div>
        <nav aria-label="Staff" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm ${isActive ? 'bg-navy-700 font-semibold' : 'text-slate-200 hover:bg-navy-800'}`}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-2">
          <span className="text-xs text-amber-800">Demo environment · simulated money only</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{auth.user?.email}</span>
            <Button variant="secondary" onClick={() => void auth.signOut()}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  )
}