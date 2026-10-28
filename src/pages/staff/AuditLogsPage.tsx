import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getAuditLogs } from '@/services/staffApi'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { formatDate } from '@/utils/format'
import { ShieldCheck, History } from 'lucide-react'

export default function AuditLogsPage() {
  const { activeOrg, hasRole } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!activeOrg) return
      try {
        const data = await getAuditLogs(activeOrg.orgId)
        setLogs(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load audit logs.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeOrg])

  if (!hasRole(['mfb_admin', 'branch_manager', 'auditor', 'compliance_officer'])) {
    return <Alert tone="error">You do not have permission to view audit logs.</Alert>
  }

  if (loading) return <Spinner label="Loading audit trail..." />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <div className="rounded-md bg-navy-50 p-2 text-navy-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Audit Trail & Compliance</h1>
          <p className="text-sm text-muted">Immutable history of system status transitions and application activity.</p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white shadow-sm overflow-hidden">
        <div className="border-b border-line bg-slate-50 p-4 flex items-center gap-2">
          <History className="h-4 w-4 text-muted" />
          <h2 className="font-semibold text-ink text-sm">Recent Status Change Traces</h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-8"><EmptyState title="No audit logs recorded yet" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-line text-xs uppercase text-muted">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Loan Reference</th>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Transition</th>
                  <th className="p-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4 text-muted whitespace-nowrap">{formatDate(log.created_at)}</td>
                    <td className="p-4 font-mono font-medium text-brand-600">{log.loan_applications?.reference}</td>
                    <td className="p-4 text-ink font-medium">{log.loan_applications?.full_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700 capitalize">{log.from_status || 'start'}</span>
                        <span>→</span>
                        <span className="rounded bg-brand-50 px-2 py-0.5 font-mono text-brand-700 capitalize">{log.to_status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted">{log.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}