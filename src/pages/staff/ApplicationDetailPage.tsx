import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { 
  getApplicationDetails, 
  addApplicationNote, 
  transitionApplicationStatus, 
  decideApplication,
  simulateDisbursement
} from '@/services/staffApi'
import { Spinner, Alert } from '@/components/feedback'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { formatNaira, formatDate } from '@/utils/format'
import type { ApplicationStatus } from '@/types/status'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { activeOrg, user } = useAuth()
  const navigate = useNavigate()

  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [noteBody, setNoteBody] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [showDecisionModal, setShowDecisionModal] = useState<'approve' | 'decline' | null>(null)

  // Custom Centered Transition Modal State
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null)
  const [transitionReason, setTransitionReason] = useState('Application details verified and valid for review.')

  useEffect(() => {
    if (id && activeOrg) {
      loadDetails()
    }
  }, [id, activeOrg])

  async function loadDetails() {
    if (!id || !activeOrg) return
    try {
      setLoading(true)
      const data = await getApplicationDetails(id, activeOrg.orgId)
      setApp(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load application details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !activeOrg || !user || !noteBody.trim()) return
    try {
      setActionLoading(true)
      await addApplicationNote(id, activeOrg.orgId, user.id, noteBody.trim())
      setNoteBody('')
      await loadDetails()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Use the approved database transition function (RPC)
  async function confirmTransition() {
    if (!id || !activeOrg || !transitionTarget) return
    try {
      setActionLoading(true)

      await transitionApplicationStatus(id, activeOrg.orgId, transitionTarget, transitionReason)

      setTransitionTarget(null)
      await loadDetails()
    } catch (err: any) {
      alert(err.message || 'Status transition failed.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDecision(decision: 'approve' | 'decline') {
    if (!id || !activeOrg || !decisionReason.trim()) return
    try {
      setActionLoading(true)
      await decideApplication(id, activeOrg.orgId, decision, decisionReason.trim())
      setShowDecisionModal(null)
      setDecisionReason('')
      await loadDetails()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDisburse() {
    if (!id || !activeOrg) return
    if (!confirm('Are you sure you want to simulate disbursement for this loan?')) return
    try {
      setActionLoading(true)
      await simulateDisbursement(id, activeOrg.orgId)
      await loadDetails()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <Spinner label="Loading application workspace..." />
  if (error || !app) return <div className="p-6"><Alert tone="error">{error || 'Application not found.'}</Alert></div>

  const documents = app.application_documents || app.documents || app.loan_documents || []
  const history = app.application_status_history || app.status_history || []
  const notes = app.application_notes || app.notes || []
  const product = app.loan_products || app.product || {}

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">{app.full_name}</h1>
            <StatusBadge status={app.status as ApplicationStatus} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted">Reference: {app.reference} · Submitted on {formatDate(app.submitted_at)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/staff/pipeline')}>← Back to Pipeline</Button>
          
          {app.status === 'new_application' && (
            <Button onClick={() => setTransitionTarget('initial_review')}>Move to Initial Review</Button>
          )}
          {app.status === 'initial_review' && (
            <Button onClick={() => setTransitionTarget('kyc_review')}>Move to KYC Review</Button>
          )}
          {app.status === 'kyc_review' && (
            <Button onClick={() => navigate(`/staff/applications/${app.id}/assessment`)}>Proceed to Assessment →</Button>
          )}
          {app.status === 'awaiting_approval' && (
            <>
              <Button variant="primary" onClick={() => setShowDecisionModal('approve')}>Approve Loan</Button>
              <Button variant="danger" onClick={() => setShowDecisionModal('decline')}>Decline Loan</Button>
            </>
          )}
          {app.status === 'approved' && (
            <Button onClick={() => setTransitionTarget('ready_for_disbursement')}>Mark Ready for Disbursement</Button>
          )}
          {app.status === 'ready_for_disbursement' && (
            <Button variant="primary" loading={actionLoading} onClick={handleDisburse}>Simulate Disbursement</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Applicant & Financial Profile */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-navy-900">Loan & Financial Details</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-muted">Loan Product</p>
                <p className="font-semibold text-navy-900">{product.name || 'Standard'}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Requested Amount</p>
                <p className="font-semibold text-emerald-700">{formatNaira(app.requested_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Requested Term</p>
                <p className="font-semibold text-navy-900">{app.requested_term_months} months</p>
              </div>
              <div>
                <p className="text-xs text-muted">Monthly Income</p>
                <p className="font-semibold text-navy-900">{formatNaira(app.monthly_income)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Monthly Expenses</p>
                <p className="font-semibold text-navy-900">{formatNaira(app.monthly_expenses || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Customer Type</p>
                <p className="font-semibold capitalize text-navy-900">{app.customer_type?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 text-sm">
              <p className="text-xs text-muted">Purpose of Loan</p>
              <p className="mt-1 text-ink">{app.purpose}</p>
            </div>
          </section>

          {/* Uploaded Documents & OCR Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">KYC & Supporting Documents</h2>
              <Button variant="secondary" onClick={() => navigate(`/staff/applications/${app.id}/documents`)}>
                Inspect OCR & Verify Docs →
              </Button>
            </div>
            
            {documents.length === 0 ? (
              <p className="text-sm text-muted">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    <div>
                      <span className="font-medium capitalize text-navy-900">{(doc.category || doc.document_type || 'document').replace('_', ' ')}</span>
                      <p className="text-xs text-muted">{doc.original_filename || doc.file_name || 'Uploaded File'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      doc.review_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      doc.review_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.review_status || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Internal Staff Notes */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-navy-900">Internal Staff Notes</h2>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted">No notes recorded yet.</p>
              ) : (
                notes.map((n: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-100">
                    <p className="text-ink">{n.body || n.note}</p>
                    <p className="mt-1 text-[10px] text-muted">{formatDate(n.created_at)}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-100">
              <input 
                type="text" 
                placeholder="Add an internal note..." 
                value={noteBody} 
                onChange={(e) => setNoteBody(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              />
              <Button type="submit" loading={actionLoading}>Post Note</Button>
            </form>
          </section>
        </div>

        {/* Right Column: Contact & Status History */}
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-navy-900">Applicant Contact</h2>
            <div className="text-sm space-y-2">
              <div>
                <p className="text-xs text-muted">Phone Number</p>
                <p className="font-medium text-navy-900">{app.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Email Address</p>
                <p className="font-medium text-navy-900">{app.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Residential Address</p>
                <p className="font-medium text-navy-900">{app.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Employer / Business</p>
                <p className="font-medium text-navy-900">{app.employer_or_business || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-navy-900">Status History</h2>
            <div className="space-y-3 border-l-2 border-slate-100 pl-4 ml-2">
              {history.map((h: any, idx: number) => (
                <div key={idx} className="relative text-xs space-y-1">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <p className="font-semibold uppercase tracking-wider text-navy-900">{h.to_status}</p>
                  {h.reason && <p className="text-muted italic">"{h.reason}"</p>}
                  <p className="text-[10px] text-slate-400">{formatDate(h.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* CENTERED STATUS TRANSITION REASON MODAL WITH DROPDOWN */}
      {transitionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-navy-900 capitalize">Move to {transitionTarget.replace('_', ' ')}</h2>
              <p className="text-xs text-muted mt-0.5">Select or enter a reason for moving this application to the next review stage.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Valid Reason Template</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-600"
                  onChange={(e) => setTransitionReason(e.target.value)}
                  value={transitionReason}
                >
                  <option value="Application details verified and valid for review.">Application details verified and valid for review.</option>
                  <option value="KYC documents received and cleared initial inspection.">KYC documents received and cleared initial inspection.</option>
                  <option value="All eligibility criteria and compliance checks met successfully.">All eligibility criteria and compliance checks met successfully.</option>
                  <option value="Approved for final payout processing.">Approved for final payout processing.</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Notes / Reason</label>
                <textarea 
                  rows={3}
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-600 shadow-inner"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setTransitionTarget(null)}>Cancel</Button>
              <Button 
                variant="primary" 
                loading={actionLoading}
                onClick={confirmTransition}
              >
                Confirm & Proceed
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL / DECLINE MODAL */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-navy-900 capitalize">{showDecisionModal} Loan Application</h2>
              <p className="text-xs text-muted mt-0.5">Please provide a mandatory reason for this final decision.</p>
            </div>
            
            <textarea 
              rows={4}
              placeholder="Enter decision rationale..."
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-600 shadow-inner"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowDecisionModal(null)}>Cancel</Button>
              <Button 
                variant={showDecisionModal === 'decline' ? 'danger' : 'primary'} 
                loading={actionLoading}
                onClick={() => handleDecision(showDecisionModal)}
              >
                Confirm {showDecisionModal}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}