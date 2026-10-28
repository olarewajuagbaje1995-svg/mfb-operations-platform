import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getAdminProducts, toggleProductStatus, createLoanProduct } from '@/services/staffApi'
import { supabase } from '@/lib/supabase'
import { Spinner, Alert } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/Field'
import { DataTable, type Column } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { formatNaira } from '@/utils/format'

export default function SettingsPage() {
  const { activeOrg, hasRole } = useAuth()
  const isAdmin = hasRole(['mfb_admin'])
  
  const [products, setProducts] = useState<any[]>([])
  const [loanTypes, setLoanTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Product Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Loan Type Management Modal State
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [typeName, setTypeName] = useState('')
  const [typeCode, setTypeCode] = useState('')
  const [typeSubmitting, setTypeSubmitting] = useState(false)
  const [typeError, setTypeError] = useState<string | null>(null)
  
  // Product Form Fields
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [eligibility, setEligibility] = useState('')
  const [minAmount, setMinAmount] = useState('20000')
  const [maxAmount, setMaxAmount] = useState('500000')
  const [minTerm, setMinTerm] = useState('1')
  const [maxTerm, setMaxTerm] = useState('6')
  const [interestPct, setInterestPct] = useState('24')
  const [interestMethod, setInterestMethod] = useState<'reducing_balance' | 'flat'>('flat')
  const [feePct, setFeePct] = useState('2')

  useEffect(() => {
    loadData()
  }, [activeOrg])

  async function loadData() {
    if (!activeOrg) return
    try {
      setLoading(true)
      const [productsData, typesRes] = await Promise.all([
        getAdminProducts(activeOrg.orgId),
        supabase.from('loan_types').select('*').eq('org_id', activeOrg.orgId).order('created_at', { ascending: false })
      ])
      
      setProducts(productsData || [])
      setLoanTypes(typesRes.data || [])
      
      // Default category selection if types exist
      if (typesRes.data && typesRes.data.length > 0 && !category) {
        setCategory(typesRes.data[0].name)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    if (!activeOrg) return
    try {
      setActionLoading(id)
      await toggleProductStatus(id, activeOrg.orgId, !currentStatus)
      await loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  function openCreateModal() {
    setEditingProduct(null)
    setCode('')
    setName('')
    setCategory(loanTypes.length > 0 ? loanTypes[0].name : 'Salary')
    setDescription('')
    setEligibility('')
    setMinAmount('20000')
    setMaxAmount('500000')
    setMinTerm('1')
    setMaxTerm('6')
    setInterestPct('24')
    setInterestMethod('flat')
    setFeePct('2')
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(product: any) {
    setEditingProduct(product)
    setCode(product.code || '')
    setName(product.name || '')
    setCategory(product.category || product.type || (loanTypes.length > 0 ? loanTypes[0].name : 'Salary'))
    setDescription(product.description || '')
    setEligibility(product.eligibility_notes || '')
    setMinAmount(String(product.min_amount || 20000))
    setMaxAmount(String(product.max_amount || 500000))
    setMinTerm(String(product.min_term_months || 1))
    setMaxTerm(String(product.max_term_months || 6))
    setInterestPct(String(product.annual_interest_pct || 24))
    setInterestMethod(product.interest_method || 'flat')
    setFeePct(String(product.fee_pct || product.processing_fee_pct || 2))
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this loan product?')) return
    try {
      setActionLoading(id)
      const { error: deleteErr } = await supabase.from('loan_products').delete().eq('id', id)
      if (deleteErr) throw deleteErr
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCreateLoanType(e: React.FormEvent) {
    e.preventDefault()
    if (!activeOrg) return
    setTypeError(null)
    try {
      setTypeSubmitting(true)
      const { error: insertErr } = await supabase.from('loan_types').insert({
        org_id: activeOrg.orgId,
        name: typeName.trim(),
        code: typeCode.trim().toUpperCase(),
      })
      if (insertErr) throw insertErr

      setIsTypeModalOpen(false)
      setTypeName('')
      setTypeCode('')
      await loadData()
    } catch (err: any) {
      setTypeError(err.message)
    } finally {
      setTypeSubmitting(false)
    }
  }

  async function handleDeleteLoanType(id: string) {
    if (!confirm('Delete this loan product type?')) return
    try {
      const { error: delErr } = await supabase.from('loan_types').delete().eq('id', id)
      if (delErr) throw delErr
      await loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!activeOrg) return
    setFormError(null)
    
    try {
      setSubmitting(true)
      const selectedCat = category || (loanTypes.length > 0 ? loanTypes[0].name : 'Salary')

      const payload = {
        org_id: activeOrg.orgId,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: selectedCat, // Ensures exact category is saved
        description: description.trim() || undefined,
        eligibility_notes: eligibility.trim() || undefined,
        min_amount: Number(minAmount),
        max_amount: Number(maxAmount),
        min_term_months: Number(minTerm),
        max_term_months: Number(maxTerm),
        annual_interest_pct: Number(interestPct),
        interest_method: interestMethod,
        fee_pct: Number(feePct),
      }

      if (editingProduct) {
        const { error: updateErr } = await supabase
          .from('loan_products')
          .update(payload)
          .eq('id', editingProduct.id)
        if (updateErr) throw updateErr
      } else {
        await createLoanProduct(payload)
      }

      setIsModalOpen(false)
      await loadData()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<any>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs font-bold">{r.code}</span> },
    { key: 'name', header: 'Product Name', render: (r) => <span className="font-medium text-navy-900">{r.name}</span> },
    { key: 'category', header: 'Product Type / Category', render: (r) => <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">{r.category || r.type || 'Salary'}</span> },
    { key: 'limits', header: 'Amount Range', render: (r) => <span className="text-muted">{formatNaira(r.min_amount)} - {formatNaira(r.max_amount)}</span> },
    { key: 'interest', header: 'Interest', render: (r) => <span className="text-muted">{r.annual_interest_pct}% ({r.interest_method})</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        isAdmin ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="text-xs !py-1 !px-2" onClick={() => openEditModal(r)}>Edit</Button>
            <Button variant="secondary" className="text-xs !py-1 !px-2" loading={actionLoading === r.id} onClick={() => handleToggleStatus(r.id, r.is_active)}>
              {r.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="secondary" className="text-xs !py-1 !px-2 text-red-600 hover:bg-red-50" loading={actionLoading === r.id} onClick={() => handleDeleteProduct(r.id)}>
              Delete
            </Button>
          </div>
        ) : null
      )
    }
  ]

  if (!isAdmin) {
    return <Alert tone="warning">You must be an MFB Administrator to view system settings.</Alert>
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">System Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage loan product categories, configure loan offerings, and organization preferences.</p>
      </div>

      {/* SECTION A: LOAN PRODUCT TYPES */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Loan Product Types / Categories</h2>
            <p className="text-xs text-muted">Define custom categories that appear on product creation and public filter tabs.</p>
          </div>
          <Button onClick={() => setIsTypeModalOpen(true)}>+ New Loan Type</Button>
        </div>
        
        <div className="p-6">
          {loanTypes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No custom loan types created yet. Click '+ New Loan Type' above to add 'Salary'.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {loanTypes.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 shadow-sm">
                  <span>{t.name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-100">{t.code}</span>
                  <button onClick={() => handleDeleteLoanType(t.id)} className="text-red-500 hover:text-red-700 ml-1 font-bold">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION B: LOAN PRODUCTS */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Loan Products</h2>
            <p className="text-xs text-muted">Configure active loan products available on the public website.</p>
          </div>
          <Button onClick={openCreateModal}>+ New Product</Button>
        </div>
        
        <div className="p-6">
          {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
          <DataTable 
            columns={columns}
            rows={products}
            rowKey={(r) => r.id}
            loading={loading}
            emptyTitle="No loan products found"
            emptyDescription="Create your first loan product to allow customers to apply."
          />
        </div>
      </section>

      {/* CREATE LOAN TYPE MODAL */}
      <Modal open={isTypeModalOpen} title="Create Loan Product Type" onClose={() => setIsTypeModalOpen(false)}>
        <form onSubmit={handleCreateLoanType} className="space-y-4 pt-2">
          {typeError && <Alert tone="error">{typeError}</Alert>}
          <TextField label="Type Name" required placeholder="e.g. Salary" value={typeName} onChange={(e) => setTypeName(e.target.value)} />
          <TextField label="Type Code" required placeholder="e.g. SAL" value={typeCode} onChange={(e) => setTypeCode(e.target.value)} />
          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsTypeModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={typeSubmitting}>Save Loan Type</Button>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal open={isModalOpen} title={editingProduct ? "Edit Loan Product" : "Create New Loan Product"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          {formError && <Alert tone="error">{formError}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Product Code" required placeholder="e.g. MSA-01" value={code} onChange={(e) => setCode(e.target.value)} />
            <TextField label="Product Name" required placeholder="e.g. Merit Salary Advance" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <SelectField label="Product Category / Type" required value={category} onChange={(e) => setCategory(e.target.value)}>
            {loanTypes.length === 0 ? (
              <option value="Salary">Salary (Default)</option>
            ) : (
              loanTypes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))
            )}
          </SelectField>

          <TextAreaField label="Description" placeholder="Briefly describe what this loan is used for..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextAreaField label="Eligibility Notes" placeholder="Who can apply? Requirements..." value={eligibility} onChange={(e) => setEligibility(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Min Amount (NGN)" type="number" required value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            <TextField label="Max Amount (NGN)" type="number" required value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Min Term (Months)" type="number" required value={minTerm} onChange={(e) => setMinTerm(e.target.value)} />
            <TextField label="Max Term (Months)" type="number" required value={maxTerm} onChange={(e) => setMaxTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <TextField label="Annual Interest (%)" type="number" step="0.1" required value={interestPct} onChange={(e) => setInterestPct(e.target.value)} />
            <SelectField label="Interest Method" value={interestMethod} onChange={(e) => setInterestMethod(e.target.value as any)}>
              <option value="reducing_balance">Reducing Balance</option>
              <option value="flat">Flat Rate</option>
            </SelectField>
            <TextField label="Processing Fee (%)" type="number" step="0.1" required value={feePct} onChange={(e) => setFeePct(e.target.value)} />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingProduct ? "Update Product" : "Save Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}