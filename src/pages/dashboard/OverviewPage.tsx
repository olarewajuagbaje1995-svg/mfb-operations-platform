import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getDashboardMetrics } from '@/services/staffApi'
import { Spinner, Alert } from '@/components/feedback'
import { formatNaira } from '@/utils/format'
import { BarChart3, Clock, AlertCircle, FileText, ArrowRight } from 'lucide-react'

// Responsibility: The operational dashboard for staff members upon logging in.
export default function OverviewPage() {
  const { activeOrg, user, hasRole } = useAuth()
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!activeOrg) return
      try {
        const data = await getDashboardMetrics(activeOrg.orgId)
        setMetrics(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeOrg])

  if (loading) return <Spinner label="Loading dashboard..." />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Welcome back, {user?.email}</h1>
        <p className="mt-1 text-sm text-muted">Here is the operational overview for {activeOrg?.orgName} today.</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-brand-50 p-2 text-brand-600"><BarChart3 className="h-5 w-5" /></div>
            <h3 className="text-sm font-medium text-muted">Active Pipeline Volume</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-navy-900">{formatNaira(metrics?.activeVolume || 0)}</p>
            <p className="mt-1 text-sm text-muted">Across {metrics?.activeCount || 0} active applications</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-amber-50 p-2 text-amber-600"><Clock className="h-5 w-5" /></div>
            <h3 className="text-sm font-medium text-muted">Awaiting Approval</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-navy-900">{metrics?.pendingApprovalCount || 0}</p>
            <p className="mt-1 text-sm text-muted">Applications ready for final review</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-red-50 p-2 text-red-600"><AlertCircle className="h-5 w-5" /></div>
            <h3 className="text-sm font-medium text-muted">Unresolved Complaints</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-navy-900">{metrics?.unresolvedComplaints || 0}</p>
            <p className="mt-1 text-sm text-muted">Support tickets requiring attention</p>
          </div>
        </div>
      </div>

      {/* Quick Action Links Based on Role */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {hasRole(['mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer']) && (
            <Link to="/staff/pipeline" className="group flex items-center justify-between rounded-lg border border-line bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-brand-50 p-3 text-brand-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-brand-600">Loan Pipeline</h3>
                  <p className="text-xs text-muted mt-0.5">Process active applications</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600" />
            </Link>
          )}

          {hasRole(['mfb_admin', 'branch_manager', 'support_officer', 'compliance_officer']) && (
            <Link to="/staff/complaints" className="group flex items-center justify-between rounded-lg border border-line bg-white p-5 shadow-sm transition-all hover:border-red-200 hover:shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-red-600">Manage Complaints</h3>
                  <p className="text-xs text-muted mt-0.5">Investigate customer tickets</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-600" />
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}