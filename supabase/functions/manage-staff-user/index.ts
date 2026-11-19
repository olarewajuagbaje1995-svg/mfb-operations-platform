import { serve } from 'https://deno.land/std@0.223.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Responsibility: admin edge function for managing staff user accounts.
// Called only from the staff portal. All secrets (service_role key) live server-side
// and are never exposed to the frontend.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STAFF_ROLES = [
  'mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer',
  'reconciliation_officer', 'compliance_officer', 'support_officer', 'auditor',
] as const

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function callerOrgId(memberships: any[]): string | undefined {
  const admin = memberships.find((m) => m.role === 'mfb_admin')
  return admin?.org_id ?? memberships[0]?.org_id
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Service-role admin client: never used in frontend code.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Verify the caller's session.
  const bearer = req.headers.get('Authorization')
  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : null
  if (!token) {
    return json({ error: 'Missing authorization token' }, 401)
  }
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !user) {
    return json({ error: 'Invalid or expired token' }, 401)
  }

  // Only an mfb_admin on an active organisation membership may manage staff.
  const { data: memberships } = await supabaseAdmin
    .from('member_roles')
    .select('user_id, role, org_id, organization_members(user_id, status)')
    .eq('user_id', user.id)
  const isAdmin = (memberships ?? []).some(
    (m) => m.role === 'mfb_admin' && m.organization_members?.status === 'active',
  )
  if (!isAdmin) {
    return json({ error: 'MFB Administrator role required' }, 403)
  }
  const orgId = callerOrgId(memberships ?? [])

  const body = (await req.json().catch(() => ({}))) as {
    action?: string
    email?: string
    password?: string
    newPassword?: string
    full_name?: string
    role?: string
    org_id?: string
    userId?: string
  }
  const { action } = body

  try {
    switch (action) {
      case 'list': {
        const { data: roleRows, error: roleError } = await supabaseAdmin
          .from('member_roles')
          .select('user_id, role, org_id, organization_members(status, organizations(name, slug))')
        if (roleError) throw roleError

        const { data: usersResp } = await supabaseAdmin.auth.admin.listUsers()
        const usersById = new Map((usersResp?.users ?? []).map((u) => [u.id, u]))

        const staff = (roleRows ?? []).map((r: any) => {
          const u = usersById.get(r.user_id)
          return {
            userId: r.user_id,
            email: u?.email ?? '',
            fullName: u?.user_metadata?.full_name ?? '',
            role: r.role,
            orgId: r.org_id,
            orgName: r.organization_members?.organizations?.name ?? '',
            status: r.organization_members?.status ?? '',
          }
        })
        return json({ staff })
      }

      case 'create': {
        const { email, password, full_name, role, org_id } = body
        if (!email || !password || !role || !org_id) {
          return json({ error: 'email, password, role and org_id are required' }, 400)
        }
        if (!STAFF_ROLES.includes(role as any)) {
          return json({ error: 'Invalid role' }, 400)
        }
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        })
        if (createError) throw createError
        const uid = created.user?.id
        if (!uid) throw new Error('Auth user was not created')

        const { error: memberError } = await supabaseAdmin.from('organization_members').insert({
          user_id: uid,
          org_id,
          status: 'active',
        })
        if (memberError) throw memberError

        const { error: roleError } = await supabaseAdmin.from('member_roles').insert({
          user_id: uid,
          org_id,
          role,
        })
        if (roleError) throw roleError

        return json({ userId: uid })
      }

      case 'reset_password': {
        const { userId, newPassword } = body
        if (!userId || !newPassword) {
          return json({ error: 'userId and newPassword are required' }, 400)
        }
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword,
        })
        if (updateError) throw updateError
        return json({ ok: true })
      }

      case 'update_role': {
        const { userId, role } = body
        if (!userId || !role) {
          return json({ error: 'userId and role are required' }, 400)
        }
        if (!STAFF_ROLES.includes(role as any)) {
          return json({ error: 'Invalid role' }, 400)
        }
        const { error: updateError } = await supabaseAdmin
          .from('member_roles')
          .update({ role })
          .eq('user_id', userId)
        if (updateError) throw updateError
        return json({ ok: true })
      }

      case 'delete': {
        const { userId } = body
        if (!userId) {
          return json({ error: 'userId is required' }, 400)
        }
        if (userId === user.id) {
          return json({ error: 'You cannot remove your own access' }, 403)
        }
        await supabaseAdmin.from('member_roles').delete().eq('user_id', userId)
        await supabaseAdmin.from('organization_members').delete().eq('user_id', userId)
        return json({ ok: true })
      }

      default:
        return json({ error: 'Unknown action' }, 400)
    }
  } catch (err: any) {
    return json({ error: err.message ?? 'Request failed' }, 500)
  }
})
