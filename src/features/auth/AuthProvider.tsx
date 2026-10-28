import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/roles'
import { AuthContext, type AuthState, type Membership } from './auth-context'

interface MemberRow {
  org_id: string
  status: string
  organizations: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null)

  const loadAccess = useCallback(async (s: Session | null) => {
    if (!s || s.user.is_anonymous) {
      setMemberships([])
      setIsPlatformAdmin(false)
      return
    }
    const uid = s.user.id
    const [mem, roles, plat] = await Promise.all([
      supabase.from('organization_members').select('org_id, status, organizations(id, name, slug)').eq('user_id', uid).eq('status', 'active'),
      supabase.from('member_roles').select('org_id, role').eq('user_id', uid),
      supabase.from('platform_roles').select('role').eq('user_id', uid),
    ])
    const roleRows = (roles.data ?? []) as { org_id: string; role: Role }[]
    const list: Membership[] = ((mem.data ?? []) as unknown as MemberRow[])
      .map((m) => {
        const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
        if (!org) return null
        return {
          orgId: m.org_id,
          orgName: org.name,
          orgSlug: org.slug,
          roles: roleRows.filter((r) => r.org_id === m.org_id).map((r) => r.role),
        } satisfies Membership
      })
      .filter((x): x is Membership => x !== null)
    setMemberships(list)
    setIsPlatformAdmin((plat.data ?? []).length > 0)
    setActiveOrgId((cur) => cur ?? list[0]?.orgId ?? null)
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return
      setSession(data.session)
      await loadAccess(data.session)
      if (!cancelled) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setTimeout(() => void loadAccess(s), 0)
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [loadAccess])

  const activeOrg = memberships.find((m) => m.orgId === activeOrgId) ?? memberships[0] ?? null

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      isStaffSession: !!session && !session.user.is_anonymous,
      isPlatformAdmin,
      memberships,
      activeOrg,
      setActiveOrgId,
      hasRole: (roles) => !!activeOrg && activeOrg.roles.some((r) => roles.includes(r)),
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? 'Sign-in failed. Check your email and password.' : null
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [loading, session, isPlatformAdmin, memberships, activeOrg],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}