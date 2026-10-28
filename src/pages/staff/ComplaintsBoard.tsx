import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getComplaints, resolveComplaint } from '@/services/staffApi'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextAreaField } from '@/components/Field'
import { formatDate } from '@/utils/format'
import { Search, CheckCircle, MessageSquareWarning } from 'lucide-react'

export default function ComplaintsBoard() {
  const { activeOrg } = useAuth()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'investigating' | 'resolved'>('investigating')
  
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolving, setResolving] = useState(false)

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

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus
      const matchesSearch = c.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.subject.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [complaints, searchQuery, filterStatus])

  const handleResolve = async () => {
    if (!selectedComplaint || !activeOrg || !resolutionNotes.trim()) return
    setResolving(true)
    try {
      await resolveComplaint(selectedComplaint.id, activeOrg.orgId, resolutionNotes)
      await load()
      setSelectedComplaint(null)
      setResolutionNotes('')
    } catch (err: any) {
      alert(err.message)
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
              {(['investigating', 'resolved', 'all'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`capitalize px-3 py-1 text-sm font-medium rounded ${filterStatus === status ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {status}
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
                  onClick={() => { setSelectedComplaint(c); setResolutionNotes(c.resolution_notes || '') }}
                  className={`cursor-pointer p-4 transition-colors hover:bg-slate-50 ${selectedComplaint?.id === c.id ? 'bg-brand-50 border-l-4 border-brand-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-slate-500">{c.reference}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-ink truncate">{c.subject}</h3>
                  <p className="text-sm text-muted mt-1 truncate">{c.full_name} · {c.phone}</p>
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
                <dd className="font-medium text-ink">{selectedComplaint.full_name}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Phone</dt>
                <dd className="font-medium text-ink">{selectedComplaint.phone}</dd>
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

            {selectedComplaint.status === 'investigating' ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-ink text-sm">Resolve Ticket</h4>
                <TextAreaField 
                  label="Resolution Notes (visible to customer)"
                  placeholder="Explain how the issue was addressed..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500" 
                  onClick={handleResolve} 
                  loading={resolving}
                  disabled={!resolutionNotes.trim()}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                </Button>
              </div>
            ) : (
              <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Resolved Ticket
                </h4>
                <p className="text-sm text-emerald-800 whitespace-pre-wrap">{selectedComplaint.resolution_notes}</p>
                <p className="text-xs text-emerald-700 mt-2">Resolved on {formatDate(selectedComplaint.resolved_at)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}