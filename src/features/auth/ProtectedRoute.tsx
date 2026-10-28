import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/feedback'
import type { Role } from '@/types/roles'
import { useAuth } from './useAuth'

interface Props {
  /** Any one of these roles grants entry. Omit to allow any staff member. */
  roles?: Role[]
  /** Only platform administrators. */
  platformOnly?: boolean
}

// Responsibility: route guard. This improves the user experience only.
// Real protection is Row Level Security and database functions: a user who bypasses this guard still gets no data.
export function ProtectedRoute({ roles, platformOnly }: Props) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) return <Spinner label="Checking your session…" />
  if (!auth.isStaffSession) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (platformOnly) {
    return auth.isPlatformAdmin ? <Outlet /> : <NoAccess />
  }
  if (!auth.activeOrg) return <NoAccess message="Your account is not linked to a bank organisation yet. Ask your administrator." />
  if (roles && !auth.hasRole(roles)) return <NoAccess />
  return <Outlet />
}

function NoAccess({ message = 'You do not have permission to view this page.' }: { message?: string }) {
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  )
}