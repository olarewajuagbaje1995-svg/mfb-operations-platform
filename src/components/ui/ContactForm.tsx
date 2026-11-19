import { useState } from 'react'
import { submitComplaint } from '@/services/publicApi'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/Field'
import { Alert } from '@/components/feedback'

// Responsibility: public contact enquiry form submitted to the existing complaints backend.
export function ContactForm({ orgSlug = 'demo-mfb' }: { orgSlug?: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [category, setCategory] = useState('other')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!customerName.trim()) {
      setError('Enter your full name.')
      return
    }
    if (!phone.trim()) {
      setError('Enter your phone number.')
      return
    }
    if (!subject.trim()) {
      setError('Enter a subject.')
      return
    }
    if (!description.trim()) {
      setError('Enter a description of your enquiry.')
      return
    }

    try {
      setSubmitting(true)
      const idempotencyKey = crypto.randomUUID()
      const payload = {
        category,
        subject,
        description,
        contact_name: customerName.trim(),
        contact_phone: phone.trim(),
        contact_email: email ? email.trim() : undefined,
      }
      await submitComplaint(orgSlug, idempotencyKey, payload)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-2xl shadow-md">
          ✓
        </div>
        <h2 className="text-xl font-bold text-brand-navy">Message sent</h2>
        <p className="text-sm text-brand-text-secondary">
          Thank you for contacting CLOBAN FINANCE. Our team will get back to you shortly.
        </p>
        <Button onClick={() => setSuccess(false)} className="bg-brand-gold text-brand-deep font-bold hover:bg-brand-gold-light">
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      <SelectField
        label="Enquiry Category"
        required
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="other">General Enquiry</option>
        <option value="service">Customer Service</option>
        <option value="fees">Fees & Charges</option>
        <option value="repayment">Loan / Repayment</option>
        <option value="fraud_concern">Fraud Concern</option>
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
          placeholder="e.g. you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <TextField
        label="Subject"
        required
        placeholder="Brief summary of your enquiry"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <TextAreaField
        label="Message"
        required
        placeholder="Tell us how we can help..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="pt-2">
        <Button type="submit" loading={submitting} className="bg-brand-gold text-brand-deep font-bold py-3.5 shadow-sm hover:bg-brand-gold-light transition-colors">
          Send Message →
        </Button>
      </div>
    </form>
  )
}
