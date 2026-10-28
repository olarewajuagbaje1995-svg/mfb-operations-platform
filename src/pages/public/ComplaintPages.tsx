import { useState } from 'react'
import { submitComplaint, trackComplaint } from '@/services/publicApi'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/Field'
import { Alert } from '@/components/feedback'

export function SubmitComplaintPage() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<any>(null)

  const [category, setCategory] = useState('loan_dispute')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)
      const idempotencyKey = crypto.randomUUID()
      const payload = {
        category,
        subject,
        description,
        full_name: customerName,
        phone,
        email: email || undefined,
      }

      const res = await submitComplaint('demo-mfb', idempotencyKey, payload)
      setSuccess(res)
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FBFA] pb-24">
        <div className="relative w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 py-16 sm:py-20 text-white overflow-hidden shadow-xl mb-12">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Support Ticket Logged</h1>
            <p className="text-emerald-100/90 text-sm">Your complaint has been successfully registered with our operations desk.</p>
          </div>
        </div>

        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 text-center shadow-xl space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-2xl shadow-md animate-bounce">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-navy-900">Ticket Reference Generated</h2>
              <p className="text-xs text-slate-500">Save your reference code to check real-time resolution updates:</p>
            </div>
            
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 font-mono text-xl font-bold text-emerald-800 shadow-inner">
              {success.reference}
            </div>

            <div className="pt-2">
              <Button onClick={() => setSuccess(null)} className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-8 rounded-2xl shadow-md">
                Submit Another Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FBFA] pb-24 space-y-12">
      
      {/* RADIANT HERO BANNER */}
      <div className="relative w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 py-16 sm:py-20 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/85 px-4 py-1.5 text-xs font-bold text-emerald-100 border border-emerald-500/40 shadow-md backdrop-blur-md">
            <span>🛡️ Merit MFBn Help & Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Customer <span className="text-emerald-300">Support Desk</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto font-light">
            Have a dispute, inquiry, or operational feedback? Raise a support ticket and our operations team will investigate promptly.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-5" noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <SelectField 
            label="Complaint Category" 
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="loan_dispute">Loan / Repayment Dispute</option>
            <option value="kyc_delay">KYC / Verification Delay</option>
            <option value="disbursement_issue">Disbursement Issue</option>
            <option value="customer_service">Customer Service Feedback</option>
            <option value="other">Other Inquiry</option>
          </SelectField>

          <TextField 
            label="Your Full Name" 
            required 
            placeholder="e.g. Adebayo Ogunlesi"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField 
              label="Phone Number" 
              required 
              placeholder="e.g. 08030000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField 
              label="Email Address" 
              type="email"
              placeholder="e.g. adebayo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <TextField 
            label="Subject / Summary" 
            required 
            placeholder="Brief summary of your issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <TextAreaField 
            label="Detailed Description" 
            required 
            placeholder="Provide as much context as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/10 transition-transform hover:scale-105">
              Submit Support Ticket →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TrackComplaintPage() {
  const [reference, setReference] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<any>(null)

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const data = await trackComplaint(reference.trim().toUpperCase(), code.trim().toUpperCase())
      setTicket(data)
    } catch (err: any) {
      setError(err.message || 'Ticket not found.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FBFA] pb-24 space-y-12">
      
      {/* RADIANT HERO BANNER */}
      <div className="relative w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 py-16 sm:py-20 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/85 px-4 py-1.5 text-xs font-bold text-emerald-100 border border-emerald-500/40 shadow-md backdrop-blur-md">
            <span>🔍 Support Ticket Lookup</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Track Support <span className="text-emerald-300">Ticket</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto font-light">
            Enter your ticket reference code and verification PIN to check investigator notes and resolution status.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 space-y-8">
        <form onSubmit={handleTrack} className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Ticket Reference" required placeholder="e.g. TCK-9912" value={reference} onChange={(e) => setReference(e.target.value)} />
            <TextField label="Tracking Code" required placeholder="e.g. A1B2C" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/10 transition-transform hover:scale-105">
              Lookup Ticket →
            </Button>
          </div>
        </form>

        {ticket && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-navy-900">{ticket.subject}</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 uppercase">
                {ticket.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
            {ticket.resolution_notes && (
              <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold uppercase tracking-wider text-emerald-800 text-[10px]">Official Resolution Update</p>
                <p className="leading-relaxed mt-1">{ticket.resolution_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}