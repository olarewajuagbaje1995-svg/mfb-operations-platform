import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getComplaints, markComplaintInvestigating, resolveComplaint } from '@/services/staffApi'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextAreaField } from '@/components/Field'
import { formatDate } from '@/utils/format'
import { Search, CheckCircle, Clock, MessageSquareWarning } from 'lucide-react'

type ComplaintFilter = 'all' | 'new' | 'investigating' | 'resolved'

export default function ComplaintsBoard() {
  const { activeOrg } = useAuth()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ComplaintFilter>('investigating')

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [resolving, setResolving] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const load = async () => {
    if (!activeOrg) return
    try {
      const data = await getComplaints(activeOrg.orgId)
      setComplaints(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [activeOrg])

  const normalizedStatus = (c: any) => String(c.status || '').toLowerCase()
  const isResolved = selectedComplaint ? normalizedStatus(selectedComplaint) === 'resolved' : false
  const resolvedAt = selectedComplaint?.resolved_at ?? selectedComplaint?.updated_at

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesStatus = filterStatus === 'all' || normalizedStatus(c) === filterStatus
      const fullName = (c.full_name || '').toLowerCase()
      const reference = (c.reference || '').toLowerCase()
      const subject = (c.subject || '').toLowerCase()
      const query = searchQuery.toLowerCase()

      const matchesSearch = reference.includes(query) ||
                            fullName.includes(query) ||
                            subject.includes(query)
      return matchesStatus && matchesSearch
    })
  }, [complaints, searchQuery, filterStatus])

  const handleMarkInvestigating = async () => {
    if (!selectedComplaint) return
    setResolving(true)
    setUpdateError(null)
    try {
      const data = await markComplaintInvestigating(selectedComplaint.id)
      // Never fake a state change: only trust the row Supabase actually returned.
      setSelectedComplaint(data)
      await load()
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to mark the ticket as investigating.')
    } finally {
      setResolving(false)
    }
  }

  const handleMarkResolved = async () => {
    if (!selectedComplaint) return
    setResolving(true)
    setUpdateError(null)
    try {
      const data = await resolveComplaint(selectedComplaint.id, resolution)
      setSelectedComplaint(data)
      await load()
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to resolve the ticket.')
    } finally {
      setResolving(false)
    }
  }

  if (loading) return <Spinner label="Loading complaints..." />
  if (error) return <Alert tone="error">{error}</Alert>

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 md:flex-row">

      {/* Left List View */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line p-4">
          <h1 className="text-xl font-semibold text-navy-900">Complaints & Support</h1>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search reference, name..."
                className="w-full rounded-md border border-line py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex rounded-md border border-line bg-slate-50 p-1">
              {(['new', 'investigating', 'resolved', 'all'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`capitalize px-3 py-1 text-sm font-medium rounded ${filterStatus === status ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredComplaints.length === 0 ? (
            <div className="p-8"><EmptyState title="No complaints found" /></div>
          ) : (
            <ul className="divide-y divide-line">
              {filteredComplaints.map(c => (
                <li
                  key={c.id}
                  onClick={() => { setSelectedComplaint(c); setResolution(c.resolution || '') }}
                  className={`cursor-pointer p-4 transition-colors hover:bg-slate-50 ${selectedComplaint?.id === c.id ? 'bg-brand-50 border-l-4 border-brand-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-slate-500">{c.reference}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      normalizedStatus(c) === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      normalizedStatus(c) === 'investigating' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-ink truncate">{c.subject}</h3>
                  <p className="text-sm text-muted mt-1 truncate">{c.full_name || 'Unknown Customer'} · {c.phone || 'N/A'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Details Panel */}
      {selectedComplaint && (
        <div className="flex w-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm md:w-96 lg:w-[400px]">
          <div className="border-b border-line bg-slate-50 p-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Ticket Details</h2>
            <button onClick={() => setSelectedComplaint(null)} className="text-muted hover:text-ink">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareWarning className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-navy-900">{selectedComplaint.subject}</h3>
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-sm text-ink whitespace-pre-wrap border border-line">
                {selectedComplaint.description}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-md border border-line">
              <div className="col-span-2">
                <dt className="text-muted text-xs uppercase">Customer Name</dt>
                <dd className="font-medium text-ink">{selectedComplaint.full_name || 'Unknown Customer'}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Phone</dt>
                <dd className="font-medium text-ink">{selectedComplaint.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Submitted</dt>
                <dd className="font-medium text-ink">{formatDate(selectedComplaint.created_at)}</dd>
              </div>
              {selectedComplaint.related_reference && (
                <div className="col-span-2">
                  <dt className="text-muted text-xs uppercase">Related Loan Ref</dt>
                  <dd className="font-mono font-medium text-brand-600">{selectedComplaint.related_reference}</dd>
                </div>
              )}
            </dl>

            <hr className="border-line" />

            {isResolved ? (
              <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Resolved Ticket
                </h4>
                {selectedComplaint.resolution ? (
                  <p className="text-sm text-emerald-800 whitespace-pre-wrap">{selectedComplaint.resolution}</p>
                ) : (
                  <p className="text-sm text-emerald-800">No resolution notes recorded.</p>
                )}
                <p className="text-xs text-emerald-700 mt-2">Resolved on {formatDate(resolvedAt)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {updateError && <Alert tone="error">{updateError}</Alert>}
                <div className="space-y-2">
                  <h4 className="font-semibold text-ink text-sm">Resolution / Response Notes</h4>
                  <TextAreaField
                    label="Resolution Notes (visible to customer)"
                    placeholder="Explain how the issue was addressed..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
                {normalizedStatus(selectedComplaint) === 'new' || normalizedStatus(selectedComplaint) === 'open' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleMarkInvestigating}
                      loading={resolving}
                      disabled={resolving}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Mark Investigating
                    </Button>
                    <Button
                      onClick={handleMarkResolved}
                      loading={resolving}
                      disabled={resolving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleMarkResolved}
                    loading={resolving}
                    disabled={resolving}
                    className="w-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
