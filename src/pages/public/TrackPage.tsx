import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { trackApplication } from '@/services/publicApi'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Field'
import { Alert } from '@/components/feedback'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, formatNaira } from '@/utils/format'
import type { ApplicationStatus } from '@/types/status'

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const [reference, setReference] = useState(searchParams.get('ref') || '')
  const [trackingCode, setTrackingCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appData, setAppData] = useState<any>(null)

  async function handleTrack(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    if (!reference.trim() || !trackingCode.trim()) {
      setError('Please provide both your application reference and tracking code.')
      return
    }

    try {
      setLoading(true)
      const data = await trackApplication(reference.trim().toUpperCase(), trackingCode.trim().toUpperCase())
      setAppData(data)
    } catch (err: any) {
      setError(err.message || 'Tracking failed. Check your reference and code.')
    } finally {
      setLoading(false)
    }
  }

  const documents = appData?.application_documents || []

  return (
    <div className="min-h-screen bg-[#F9FBFA] pb-24 space-y-12">
      
      {/* RADIANT EDGE-TO-EDGE HERO BANNER */}
      <div className="relative w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 py-16 sm:py-20 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/85 px-4 py-1.5 text-xs font-bold text-emerald-100 border border-emerald-500/40 shadow-md backdrop-blur-md">
            <span>✨ Merit MFBn Live Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Track your <span className="text-emerald-300">application status.</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto font-light">
            Enter your unique reference and secure tracking code to check your credit review progress and view your verified document extraction results.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
        {/* TRACKING INPUT FORM CARD */}
        <form onSubmit={handleTrack} className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-6 transition-all">
          {error && <Alert tone="error">{error}</Alert>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField 
              label="Application Reference" 
              required 
              placeholder="e.g. MFB-ABC12"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <TextField 
              label="Secure Tracking Code" 
              required 
              placeholder="e.g. A1B2C3D4E5"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/10 transition-transform hover:scale-105">
              Check Status →
            </Button>
          </div>
        </form>

        {/* APPLICATION STATUS & DETAILS RESULT CARD */}
        {appData && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">REF: {appData.reference}</span>
                <h2 className="text-2xl font-black text-navy-900 mt-2">Application Overview</h2>
              </div>
              <StatusBadge status={appData.status as ApplicationStatus} />
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Submitted On</span>
                <p className="font-bold text-navy-900 mt-0.5">{formatDate(appData.submitted_at)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Requested Amount</span>
                <p className="font-extrabold text-emerald-800 font-mono text-base mt-0.5">{formatNaira(Number(appData.requested_amount))}</p>
              </div>
            </div>

            {/* Document Inspection & OCR Extraction Results Display */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-navy-900">Submitted Documents & OCR Verification</h3>
                <p className="text-xs text-slate-500">Review the verification documents attached to your application and their extracted OCR contents.</p>
              </div>
              
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No documents were attached to this application.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold capitalize text-sm text-navy-900">{doc.category.replace('_', ' ')}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          doc.review_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          doc.review_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.review_status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>File: <strong className="text-slate-700">{doc.original_filename}</strong></span>
                        <span>Uploaded: {formatDate(doc.created_at)}</span>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OCR Text Extraction Results</span>
                        <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {doc.ocr_extracted_text || 'No text extracted from this document.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}