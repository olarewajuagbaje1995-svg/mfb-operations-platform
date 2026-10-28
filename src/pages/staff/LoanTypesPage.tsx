import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { Spinner, Alert } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextField, TextAreaField } from '@/components/Field'
import { DataTable, type Column } from '@/components/DataTable'
import { Modal } from '@/components/Modal'

export default function LoanTypesPage() {
  const { activeOrg, hasRole } = useAuth()
  const isAdmin = hasRole(['mfb_admin'])

  const [loanTypes, setLoanTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadLoanTypes()
  }, [activeOrg])

  async function loadLoanTypes() {
    if (!activeOrg) return
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('loan_types')
        .select('*')
        .eq('org_id', activeOrg.orgId)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setLoanTypes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault()
    if (!activeOrg) return
    setFormError(null)

    try {
      setSubmitting(true)
      const { error: insertErr } = await supabase.from('loan_types').insert({
        org_id: activeOrg.orgId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
      })

      if (insertErr) throw insertErr

      setIsModalOpen(false)
      setName('')
      setCode('')
      setDescription('')
      await loadLoanTypes()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteType(id: string) {
    if (!confirm('Are you sure you want to delete this loan type?')) return
    try {
      const { error: delErr } = await supabase.from('loan_types').delete().eq('id', id)
      if (delErr) throw delErr
      await loadLoanTypes()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const columns: Column<any>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs font-bold">{r.code}</span> },
    { key: 'name', header: 'Loan Type Name', render: (r) => <span className="font-bold text-navy-900">{r.name}</span> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-xs text-slate-600">{r.description || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        isAdmin ? (
          <Button variant="secondary" className="text-xs !py-1 !px-2 text-red-600 hover:bg-red-50" onClick={() => handleDeleteType(r.id)}>
            Delete
          </Button>
        ) : null
      )
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loan Product Types</h1>
          <p className="mt-1 text-sm text-muted">Manage the custom loan categories available when creating products and public filters.</p>
        </div>
        {isAdmin && <Button onClick={() => setIsModalOpen(true)}>+ New Loan Type</Button>}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
        <DataTable 
          columns={columns}
          rows={loanTypes}
          rowKey={(r) => r.id}
          loading={loading}
          emptyTitle="No loan types found"
          emptyDescription="Create your first loan type category."
        />
      </section>

      <Modal open={isModalOpen} title="Create Loan Type" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateType} className="space-y-4 pt-2">
          {formError && <Alert tone="error">{formError}</Alert>}
          <TextField label="Type Name" required placeholder="e.g. Salary Advance" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Type Code" required placeholder="e.g. SALARY" value={code} onChange={(e) => setCode(e.target.value)} />
          <TextAreaField label="Description" placeholder="Optional category description..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Loan Type</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}