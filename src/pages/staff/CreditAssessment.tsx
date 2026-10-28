import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getApplicationDetails, submitCreditAssessment } from '@/services/staffApi'
import { Spinner, Alert } from '@/components/feedback'
import { Button } from '@/components/Button'
import { TextField, TextAreaField, SelectField } from '@/components/Field'
import { ArrowLeft, Calculator } from 'lucide-react'
import { formatNaira } from '@/utils/format'

export default function CreditAssessment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeOrg } = useAuth()
  
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [creditScore, setCreditScore] = useState('')
  const [dtiRatio, setDtiRatio] = useState('')
  const [riskTier, setRiskTier] = useState('medium')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      if (!activeOrg || !id) return
      try {
        const data = await getApplicationDetails(id, activeOrg.orgId)
        setApp(data)
        
        // Auto-calculate DTI if income/expenses were provided by the applicant
        if (data.monthly_income) {
          const income = Number(data.monthly_income)
          const expenses = Number(data.monthly_expenses || 0)
          if (income > 0) {
            const calculatedDti = ((expenses / income) * 100).toFixed(1)
            setDtiRatio(calculatedDti)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load application.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, activeOrg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrg || !id) return
    setSubmitting(true)
    setError(null)

    const payload = {
      credit_score: Number(creditScore),
      dti_ratio: Number(dtiRatio),
      risk_tier: riskTier,
      assessment_notes: notes
    }

    try {
      await submitCreditAssessment(id, activeOrg.orgId, payload)
      // Navigate back to the workspace after successful assessment
      navigate(`/staff/applications/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit credit assessment.')
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner label="Loading assessment workspace..." />
  if (!app) return <Alert tone="error">Application not found.</Alert>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/staff/applications/${id}`} className="rounded-full bg-white p-2 text-muted hover:text-ink shadow-sm border border-line">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Credit Assessment</h1>
          <p className="text-sm text-muted">Evaluate risk for {app.full_name} ({app.reference})</p>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Context Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="rounded-lg border border-line bg-slate-50 p-4 shadow-sm">
            <h3 className="font-semibold text-ink text-sm flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4" /> Applicant Financials
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Requested Loan</dt>
                <dd className="font-medium text-ink">{formatNaira(app.requested_amount)} over {app.requested_term_months} months</dd>
              </div>
              <div>
                <dt className="text-muted">Stated Monthly Income</dt>
                <dd className="font-medium text-ink">{formatNaira(app.monthly_income)}</dd>
              </div>
              <div>
                <dt className="text-muted">Stated Monthly Expenses</dt>
                <dd className="font-medium text-ink">{formatNaira(app.monthly_expenses || 0)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Assessment Form */}
        <div className="col-span-2 rounded-lg border border-line bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <TextField 
                label="Credit Score" 
                type="number" 
                required 
                placeholder="e.g. 720"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
              />
              <TextField 
                label="DTI Ratio (%)" 
                type="number" 
                step="0.1" 
                required 
                value={dtiRatio}
                onChange={(e) => setDtiRatio(e.target.value)}
                hint="Debt-to-Income percentage"
              />
            </div>

            <SelectField 
              label="Risk Tier" 
              required
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value)}
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </SelectField>

            <TextAreaField 
              label="Assessment Notes & Justification" 
              required
              rows={4}
              placeholder="Detail your findings, references to credit bureau reports, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-4 border-t border-line flex justify-end">
              <Button type="submit" loading={submitting} className="w-full sm:w-auto">
                Submit Assessment & Send to Approver
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}