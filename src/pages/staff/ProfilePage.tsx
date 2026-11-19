import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS, type Role } from '@/types/roles'
import { Alert, Spinner } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextField, SelectField } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { DataTable, type Column } from '@/components/DataTable'

const STAFF_ROLES: Role[] = [
  'mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer',
  'reconciliation_officer', 'compliance_officer', 'support_officer', 'auditor',
]

interface StaffRow {
  userId: string
  email: string
  fullName: string
  role: string
  orgId: string
  orgName: string
  status: string
}

// Responsibility: staff profile page. Every signed-in staff member can view and update
// their own profile; mfb_admin accounts additionally manage staff access.
export default function ProfilePage() {
  const auth = useAuth()
  const user = auth.user
  const isAdmin = auth.hasRole(['mfb_admin'])

  // --- My profile state ---
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  // --- Staff accounts state (mfb_admin only) ---
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addRole, setAddRole] = useState<Role>('loan_officer')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetUserId, setResetUserId] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    setDisplayName(user?.user_metadata?.full_name ?? '')
  }, [user])

  async function loadStaff() {
    if (!isAdmin) return
    try {
      setStaffLoading(true)
      const { data, error } = await supabase.functions.invoke('manage-staff-user', {
        body: { action: 'list' },
      })
      if (error) throw error
      setStaff((data as { staff?: StaffRow[] } | null)?.staff ?? [])
    } catch (err: any) {
      setStaffError(err.message || 'Failed to load staff accounts.')
    } finally {
      setStaffLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadStaff()
  }, [isAdmin])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileMessage(null)
    if (!user) return
    try {
      setProfileLoading(true)
      const updates: Parameters<typeof supabase.auth.updateUser>[0] = {}
      const currentName = user.user_metadata?.full_name ?? ''
      if (displayName.trim() !== currentName) updates.data = { full_name: displayName.trim() }
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error('Passwords do not match.')
        updates.password = newPassword
      }
      if (Object.keys(updates).length === 0) return
      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error
      setProfileMessage('Profile saved successfully.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    if (!auth.activeOrg) return
    try {
      setAddLoading(true)
      const { error } = await supabase.functions.invoke('manage-staff-user', {
        body: {
          action: 'create',
          email: addEmail.trim(),
          password: addPassword,
          full_name: addName.trim(),
          role: addRole,
          org_id: auth.activeOrg.orgId,
        },
      })
      if (error) throw error
      setAddOpen(false)
      setAddName('')
      setAddEmail('')
      setAddPassword('')
      setAddRole('loan_officer')
      await loadStaff()
    } catch (err: any) {
      setAddError(err.message || 'Failed to create staff account.')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleChangeRole(row: StaffRow, role: Role) {
    if (row.userId === auth.user?.id) return
    try {
      const { error } = await supabase.functions.invoke('manage-staff-user', {
        body: { action: 'update_role', userId: row.userId, role },
      })
      if (error) throw error
      setStaff(staff.map((r) => (r.userId === row.userId ? { ...r, role } : r)))
    } catch (err: any) {
      alert(err.message || 'Failed to update role.')
    }
  }

  async function handleResetPassword() {
    setAddError(null)
    try {
      setResetLoading(true)
      const { error } = await supabase.functions.invoke('manage-staff-user', {
        body: { action: 'reset_password', userId: resetUserId, newPassword: resetPassword },
      })
      if (error) throw error
      setResetOpen(false)
      setResetUserId('')
      setResetPassword('')
      await loadStaff()
    } catch (err: any) {
      setAddError(err.message || 'Failed to reset password.')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleRemoveAccess(userId: string) {
    if (userId === auth.user?.id) {
      alert('You cannot remove your own access.')
      return
    }
    if (!confirm('Remove this staff member’s access?')) return
    try {
      const { error } = await supabase.functions.invoke('manage-staff-user', {
        body: { action: 'delete', userId },
      })
      if (error) throw error
      setStaff(staff.filter((r) => r.userId !== userId))
    } catch (err: any) {
      alert(err.message || 'Failed to remove access.')
    }
  }

  const columns: Column<StaffRow>[] = [
    { key: 'email', header: 'Email', render: (r) => <span className="font-medium text-ink">{r.email}</span> },
    { key: 'fullName', header: 'Full Name', render: (r) => <span className="text-muted">{r.fullName || '—'}</span> },
    { key: 'role', header: 'Role', render: (r) => <span className="text-muted text-sm capitalize">{ROLE_LABELS[r.role as Role] ?? r.role}</span> },
    { key: 'org', header: 'Organisation', render: (r) => <span className="text-muted">{r.orgName}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <select
            value={r.role as Role}
            onChange={(e) => void handleChangeRole(r, e.target.value as Role)}
            className="block w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-600 focus:outline-2 focus:outline-brand-600"
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <Button variant="secondary" className="text-xs !py-1 !px-2" onClick={() => { setResetUserId(r.userId); setResetOpen(true) }}>
            Reset Password
          </Button>
          <Button variant="secondary" className="text-xs !py-1 !px-2 text-red-600 hover:bg-red-50" onClick={() => handleRemoveAccess(r.userId)}>
            Remove Access
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Profile & Staff</h1>
        <p className="mt-1 text-sm text-muted">Manage your account details. Administrators can also manage staff accounts and access.</p>
      </div>

      {/* SECTION 1: MY PROFILE & CHANGE PASSWORD */}
      <section className="rounded-xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-900">My Profile & Change Password</h2>
          <p className="mt-1 text-xs text-muted">Update your display name and password. Available to all staff roles.</p>
        </div>
        <div className="p-6">
          {profileError && <Alert tone="error">{profileError}</Alert>}
          {profileMessage && <Alert tone="success">{profileMessage}</Alert>}
          <form onSubmit={saveProfile} className="space-y-4 mt-4 max-w-xl">
            <TextField
              label="Full Name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="New Password"
                type="password"
                hint="Leave blank to keep your current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="secondary" type="button" onClick={() => { setProfileError(null); setProfileMessage(null) }}>
                Clear
              </Button>
              <Button type="submit" loading={profileLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 2: STAFF ACCOUNTS & ACCESS MANAGEMENT (mfb_admin only) */}
      {isAdmin ? (
        <section className="rounded-xl border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Staff Accounts & Access Management</h2>
              <p className="mt-1 text-xs text-muted">Add staff, change roles, reset passwords, and remove access.</p>
            </div>
            <Button onClick={() => setAddOpen(true)}>+ Add Staff User</Button>
          </div>
          <div className="p-6">
            {staffError && <Alert tone="error">{staffError}</Alert>}
            {staffLoading ? (
              <Spinner label="Loading staff accounts…" />
            ) : (
              <DataTable
                columns={columns}
                rows={staff}
                rowKey={(r) => r.userId}
                emptyTitle="No staff accounts found"
                emptyDescription="Add your first staff user above."
              />
            )}
          </div>

          {/* ADD STAFF USER MODAL */}
          <Modal open={addOpen} title="Add Staff User" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleAddStaff} className="space-y-4 pt-2">
              {addError && <Alert tone="error">{addError}</Alert>}
              <TextField label="Full Name" required value={addName} onChange={(e) => setAddName(e.target.value)} />
              <TextField label="Email" type="email" required value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
              <TextField label="Temporary Password" type="password" required value={addPassword} onChange={(e) => setAddPassword(e.target.value)} hint="Share this with the new staff member; they can change it on their profile." />
              <SelectField label="Role" required value={addRole} onChange={(e) => setAddRole(e.target.value as Role)}>
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </SelectField>
              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-line">
                <Button variant="secondary" type="button" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={addLoading}>
                  Add Staff User
                </Button>
              </div>
            </form>
          </Modal>

          {/* RESET PASSWORD MODAL */}
          <Modal open={resetOpen} title="Reset Password" onClose={() => setResetOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword() }} className="space-y-4 pt-2">
              <p className="text-sm text-muted">Set a temporary password for this staff member. They will need to change it on their profile.</p>
              <TextField label="New Password" type="password" required value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-line">
                <Button variant="secondary" type="button" onClick={() => setResetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={resetLoading}>
                  Reset Password
                </Button>
              </div>
            </form>
          </Modal>
        </section>
      ) : null}
    </div>
  )
}
