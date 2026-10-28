import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { getApplicationDetails } from '@/services/staffApi'
import { Spinner, Alert } from '@/components/feedback'
import { Button } from '@/components/Button'
import { formatDate } from '@/utils/format'

export default function DocumentReview() {
  const { id } = useParams<{ id: string }>()
  const { activeOrg } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appData, setAppData] = useState<any>(null)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (id && activeOrg) {
      loadData()
    }
  }, [id, activeOrg])

  async function loadData() {
    if (!id || !activeOrg) return
    try {
      setLoading(true)
      const data = await getApplicationDetails(id, activeOrg.orgId)
      setAppData(data)
      if (data.application_documents?.length > 0 && !selectedDoc) {
        setSelectedDoc(data.application_documents[0])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load application documents.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReviewStatus(docId: string, status: 'accepted' | 'rejected' | 'replacement_requested', reason?: string) {
    if (!activeOrg) return
    try {
      setActionLoading(true)
      const { error: updateError } = await supabase
        .from('application_documents')
        .update({
          review_status: status,
          review_notes: reason || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', docId)

      if (updateError) throw updateError

      setShowRejectModal(false)
      setRejectReason('')
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to update document status.')
    } finally {
      setActionLoading(false)
    }
  }

  async function getSecureFileUrl(storagePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, 300) // 5 minutes expiry

      if (error) throw error
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (err: any) {
      alert('Could not generate secure preview link: ' + err.message)
    }
  }

  if (loading) return <Spinner label="Loading document review workspace..." />
  if (error || !appData) return <div className="p-6"><Alert tone="error">{error || 'Application not found.'}</Alert></div>

  const documents = appData.application_documents || []

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">Document Review & KYC Inspection</h1>
            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">REF: {appData.reference}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Applicant: <strong>{appData.full_name}</strong> · Review and verify attached supporting documents.</p>
        </div>

        <Button variant="secondary" onClick={() => navigate(`/staff/applications/${id}`)}>
          ← Back to Application Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Documents */}
        <div className="space-y-4 lg:col-span-1">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-navy-900">Attached Documents ({documents.length})</h2>
            
            {documents.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No documents uploaded for this application yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => {
                  const isSelected = selectedDoc?.id === doc.id
                  return (
                    <div 
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`cursor-pointer rounded-lg p-3 text-sm border transition-all ${
                        isSelected ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold capitalize text-navy-900">{doc.category.replace('_', ' ')}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                          doc.review_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          doc.review_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          doc.review_status === 'replacement_requested' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {doc.review_status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1 truncate">{doc.original_filename}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(doc.created_at)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Inspection & OCR Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-navy-900 capitalize">{selectedDoc.category.replace('_', ' ')}</h2>
                  <p className="text-xs text-muted font-mono">{selectedDoc.original_filename}</p>
                </div>
                <Button onClick={() => getSecureFileUrl(selectedDoc.storage_path)}>
                  Preview Original Document ↗
                </Button>
              </div>

              {/* Review Action Controls */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reviewer Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary" 
                    loading={actionLoading}
                    onClick={() => handleReviewStatus(selectedDoc.id, 'accepted')}
                  >
                    ✓ Approve Document
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => setShowRejectModal(true)}
                  >
                    ✕ Reject Document
                  </Button>
                  <Button 
                    variant="secondary"
                    loading={actionLoading}
                    onClick={() => handleReviewStatus(selectedDoc.id, 'replacement_requested', 'Please upload a clearer replacement document.')}
                  >
                    Request Replacement
                  </Button>
                </div>

                {selectedDoc.review_notes && (
                  <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <strong>Review Note:</strong> {selectedDoc.review_notes}
                  </p>
                )}
              </div>

              {/* OCR Text Extraction Panel */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-navy-900">OCR Text Extraction Results</h3>
                <p className="text-xs text-muted">Extracted text values parsed from uploaded document image/PDF for automated verification reference.</p>
                
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans shadow-inner max-h-60 overflow-y-auto">
                  {selectedDoc.ocr_extracted_text || 'No OCR text extracted yet or text extraction pending.'}
                </div>
              </div>
            </section>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Select a document from the left list to inspect details, view OCR text, and record review decisions.
            </div>
          )}
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-navy-900">Reject Document</h2>
            <p className="text-sm text-muted">Please provide a mandatory reason for rejecting this document so the customer can provide a correction.</p>
            <textarea 
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-emerald-600"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button 
                variant="danger" 
                loading={actionLoading}
                onClick={() => handleReviewStatus(selectedDoc.id, 'rejected', rejectReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}