import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getDashboardMetrics } from '@/services/staffApi'
import { Spinner, Alert } from '@/components/feedback'
import { formatNaira, formatDate } from '@/utils/format'
import { StatusBadge } from '@/components/StatusBadge'
import { CheckCircle2, Clock, AlertCircle, FileText, ArrowRight, TrendingUp, ShieldCheck, Activity } from 'lucide-react'
import type { ApplicationStatus } from '@/types/status'

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

  if (loading) return <Spinner label="Loading operational command center..." />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-navy-900 p-8 text-white shadow-xl sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4 animate-pulse" /> Live Operational Command
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.email}</h1>
          <p className="mt-1 text-sm text-slate-300">Here is your real-time performance summary and active portfolio metrics for <span className="font-semibold text-white">{activeOrg?.orgName}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/staff/pipeline" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-500">
            View Loan Pipeline →
          </Link>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Real Active Disbursed Loans */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 transition hover:shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Loan Portfolio</span>
            <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-navy-900">{formatNaira(metrics?.activeLoanVolume || 0)}</p>
            <p className="mt-1 text-xs text-muted">Across <span className="font-semibold text-navy-900">{metrics?.activeLoanCount || 0}</span> disbursed active loans</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Today's Disbursed Volume */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 transition hover:shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Disbursed Today</span>
            <div className="rounded-full bg-blue-50 p-2.5 text-blue-600"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-navy-900">{formatNaira(metrics?.todayDisbursedVolume || 0)}</p>
            <p className="mt-1 text-xs text-muted"><span className="font-semibold text-navy-900">{metrics?.todayDisbursedCount || 0}</span> loans funded today</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: metrics?.todayDisbursedCount > 0 ? '100%' : '0%' }} />
          </div>
        </div>

        {/* Awaiting Approval */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 transition hover:shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Awaiting Approval</span>
            <div className="rounded-full bg-amber-50 p-2.5 text-amber-600"><Clock className="h-5 w-5" /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-navy-900">{metrics?.pendingApprovalCount || 0}</p>
            <p className="mt-1 text-xs text-muted">Applications ready for final review</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((metrics?.pendingApprovalCount || 0) * 20, 100)}%` }} />
          </div>
        </div>

        {/* Unresolved Complaints */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 transition hover:shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Tickets</span>
            <div className="rounded-full bg-red-50 p-2.5 text-red-600"><AlertCircle className="h-5 w-5" /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-navy-900">{metrics?.unresolvedComplaints || 0}</p>
            <p className="mt-1 text-xs text-muted">Unresolved customer complaints</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((metrics?.unresolvedComplaints || 0) * 25, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Summary Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Pipeline Exposure</h2>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-xs text-muted">Total Active Pipeline</p>
                <p className="text-lg font-bold text-navy-900 mt-0.5">{formatNaira(metrics?.totalPipelineVolume || 0)}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {metrics?.totalPipelineCount || 0} Apps
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Active pipeline tracks all ongoing applications currently undergoing KYC review, credit scoring, or pending final executive sign-off.
            </p>
          </div>
        </div>

        {/* Recent Applications Preview Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Recent Loan Submissions</h2>
            <Link to="/staff/pipeline" className="text-xs font-semibold text-emerald-700 hover:underline">
              View All Pipeline →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">Applicant / Ref</th>
                  <th className="p-3">Requested Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.recentApplications?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-xs text-muted">No applications recorded yet.</td>
                  </tr>
                ) : (
                  metrics?.recentApplications?.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3">
                        <Link to={`/staff/applications/${app.id}`} className="font-semibold text-navy-900 hover:text-emerald-700">
                          {app.full_name}
                        </Link>
                        <p className="text-[10px] font-mono text-muted">{app.reference}</p>
                      </td>
                      <td className="p-3 font-medium text-emerald-700">{formatNaira(app.requested_amount)}</td>
                      <td className="p-3"><StatusBadge status={app.status as ApplicationStatus} /></td>
                      <td className="p-3 text-right text-xs text-muted">{formatDate(app.submitted_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hasRole(['mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer']) && (
            <Link to="/staff/pipeline" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-600 transition">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 group-hover:text-emerald-700 transition">Loan Pipeline</h3>
                  <p className="text-xs text-muted mt-0.5">Manage active applications, KYC reviews, and disbursements.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition" />
            </Link>
          )}

          {hasRole(['mfb_admin', 'branch_manager', 'support_officer', 'compliance_officer']) && (
            <Link to="/staff/complaints" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-red-600 transition">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-red-50 p-3.5 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 group-hover:text-red-700 transition">Manage Complaints</h3>
                  <p className="text-xs text-muted mt-0.5">Investigate customer support tickets and update SLA statuses.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}