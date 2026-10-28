import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getPipeline } from '@/services/staffApi'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { DataTable, type Column } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatNaira, formatDate } from '@/utils/format'
import type { ApplicationStatus } from '@/types/status'

export default function PipelinePage() {
  const { activeOrg } = useAuth()
  const navigate = useNavigate()

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadPipeline()
  }, [activeOrg])

  async function loadPipeline() {
    if (!activeOrg) return
    try {
      setLoading(true)
      const data = await getPipeline(activeOrg.orgId)
      setApplications(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline applications.')
    } finally {
      setLoading(false)
    }
  }

  // Filter applications by status if selected
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'ALL') return true
    return app.status === statusFilter
  })

  const columns: Column<any>[] = [
    { 
      key: 'reference', 
      header: 'Reference', 
      render: (r) => <span className="font-mono text-xs font-bold text-navy-900">{r.reference}</span> 
    },
    { 
      key: 'full_name', 
      header: 'Applicant Name', 
      render: (r) => <span className="font-medium text-ink">{r.full_name}</span> 
    },
    { 
      key: 'product', 
      header: 'Loan Product', 
      render: (r) => <span className="text-muted">{r.loan_products?.name || 'Standard Loan'}</span> 
    },
    { 
      key: 'amount', 
      header: 'Requested Amount', 
      render: (r) => <span className="font-semibold text-navy-900">{formatNaira(r.requested_amount)}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r) => <StatusBadge status={r.status as ApplicationStatus} /> 
    },
    { 
      key: 'submitted_at', 
      header: 'Submitted', 
      render: (r) => <span className="text-xs text-muted">{formatDate(r.submitted_at)}</span> 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loan Pipeline</h1>
          <p className="mt-1 text-sm text-muted">Monitor and manage all active customer loan applications in real time.</p>
        </div>
        
        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-xs font-medium text-slate-700">Filter Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-900 outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Applications</option>
            <option value="new_application">New Application</option>
            <option value="initial_review">Initial Review</option>
            <option value="documents_required">Documents Required</option>
            <option value="kyc_review">KYC Review</option>
            <option value="credit_assessment">Credit Assessment</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="active_loan">Active Loan</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6">
        <DataTable 
          columns={columns}
          rows={filteredApplications}
          rowKey={(r) => r.id}
          loading={loading}
          emptyTitle="No loan applications found"
          emptyDescription={statusFilter === 'ALL' ? "No applications have been submitted yet." : `No applications with status "${statusFilter}" found.`}
          onRowClick={(r) => navigate(`/staff/applications/${r.id}`)}
        />
      </section>
    </div>
  )
}