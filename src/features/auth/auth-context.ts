import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Role } from '@/types/roles'

export interface Membership {
  orgId: string
  orgName: string
  orgSlug: string
  roles: Role[]
}

export interface AuthState {
  loading: boolean
  session: Session | null
  user: User | null
  /** true only for a signed-in, non-anonymous account */
  isStaffSession: boolean
  isPlatformAdmin: boolean
  memberships: Membership[]
  activeOrg: Membership | null
  setActiveOrgId: (orgId: string) => void
  hasRole: (roles: Role[]) => boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)