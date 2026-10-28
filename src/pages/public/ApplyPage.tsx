import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getPublicOrg, getActiveProducts, submitApplication } from '@/services/publicApi'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/Field'
import { Alert, Spinner } from '@/components/feedback'
import { formatNaira } from '@/utils/format'
// Import local OCR runner and field extractor
import { runOCR, extractOcrFields } from '@/utils/ocr'

const STEPS = [
  { id: 1, title: 'Personal Info', desc: 'Identity & contact details' },
  { id: 2, title: 'Employment', desc: 'Income & monthly cashflow' },
  { id: 3, title: 'Loan Request', desc: 'Amount, term & purpose' },
  { id: 4, title: 'Documents', desc: 'ID, address & bank statements' },
  { id: 5, title: 'Review & Submit', desc: 'Verify and authorize' },
]

export default function ApplyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedProduct = searchParams.get('product') || ''

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [org, setOrg] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<any>(null)

  // Wizard Step State with animation trigger
  const [currentStep, setCurrentStep] = useState(1)
  const [animating, setAnimating] = useState(false)

  // Form Fields
  const [productId, setProductId] = useState(preselectedProduct)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [customerType, setCustomerType] = useState('salaried')
  const [employer, setEmployer] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [requestedAmount, setRequestedAmount] = useState('')
  const [requestedTerm, setRequestedTerm] = useState('6')
  const [purpose, setPurpose] = useState('')
  const [consent, setConsent] = useState(false)

  // Staged Files for Upload
  const [idFile, setIdFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [bankFile, setBankFile] = useState<File | null>(null)

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const bankOrg = await getPublicOrg('demo-mfb')
        setOrg(bankOrg)
        const activeProducts = await getActiveProducts(bankOrg.id)
        setProducts(activeProducts)
        if (!productId && activeProducts.length > 0) {
          setProductId(activeProducts[0].id)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize application form.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const selectedProductData = products.find((p) => p.id === productId)

  function changeStep(targetStep: number) {
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep(targetStep)
      setAnimating(false)
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }, 150)
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !address.trim()) {
        setError('Please complete all required personal information fields.')
        return
      }
    } else if (currentStep === 2) {
      if (!monthlyIncome || Number(monthlyIncome) <= 0) {
        setError('Please provide a valid estimated monthly income.')
        return
      }
    } else if (currentStep === 3) {
      if (!requestedAmount || Number(requestedAmount) <= 0 || !purpose.trim()) {
        setError('Please specify a valid loan amount and explain the purpose.')
        return
      }
      if (selectedProductData) {
        const amt = Number(requestedAmount)
        if (amt < selectedProductData.min_amount || amt > selectedProductData.max_amount) {
          setError(`Requested amount must be between ${formatNaira(selectedProductData.min_amount)} and ${formatNaira(selectedProductData.max_amount)}.`)
          return
        }
      }
    }

    if (currentStep < 5) {
      changeStep(currentStep + 1)
    }
  }

  function handlePrev() {
    setError(null)
    if (currentStep > 1) {
      changeStep(currentStep - 1)
    }
  }

  async function handleFinalSubmit() {
    if (!org) return
    setError(null)

    if (!consent) {
      setError('You must accept the privacy and credit check consent declarations to proceed.')
      return
    }

    try {
      setSubmitting(true)
      const idempotencyKey = crypto.randomUUID()
      const payload = {
        full_name: fullName,
        phone,
        email: email || undefined,
        address,
        customer_type: customerType as "salaried" | "self_employed" | "small_business" | "other",
        employer_or_business: employer || undefined,
        monthly_income: Number(monthlyIncome),
        monthly_expenses: monthlyExpenses ? Number(monthlyExpenses) : 0,
        loan_product_id: productId,
        requested_amount: Number(requestedAmount),
        requested_term_months: Number(requestedTerm),
        purpose,
        consent_given: consent,
      }

      // 1. Submit application to create the parent record & get application ID
      const result = await submitApplication(org.slug, idempotencyKey, payload)
      const appId = result.application_id

      const filesToUpload = [
        { file: idFile, category: 'government_id' },
        { file: addressFile, category: 'proof_of_address' },
        { file: bankFile, category: 'bank_statement' },
      ]

      // 2. Process files, run local OCR, and insert records with all required fields
      for (const item of filesToUpload) {
        if (item.file) {
          let extractedText = ''
          let parsedData: { suggested_expiry: string | null; suggested_name: string | null } = { 
            suggested_expiry: null, 
            suggested_name: null 
          }

          try {
            const ocrResult = await runOCR(item.file, () => {})
            extractedText = ocrResult.text
            parsedData = extractOcrFields(extractedText)
          } catch (ocrErr: any) {
            console.warn('OCR processing skipped or failed for file:', ocrErr)
            extractedText = 'OCR Extraction failed or file unreadable.'
          }

          const fileExt = item.file.name.split('.').pop()
          const fileName = `${appId}/${crypto.randomUUID()}.${fileExt}`

          // Upload file to Supabase storage bucket
          const { error: storageError } = await supabase.storage
            .from('documents')
            .upload(fileName, item.file)

          if (storageError) throw storageError

          // Insert into application_documents table satisfying all constraints
          const { error: dbError } = await supabase.from('application_documents').insert({
            org_id: org.id,
            application_id: appId,
            category: item.category,
            storage_path: fileName,
            original_filename: item.file.name,
            mime_type: item.file.type,
            size_bytes: item.file.size,
            ocr_extracted_text: extractedText,
            suggested_name: parsedData.suggested_name,
            suggested_expiry: parsedData.suggested_expiry,
            review_status: 'pending',
          })

          if (dbError) throw dbError
        }
      }

      setSuccessResult(result)
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner label="Loading application portal..." />

  if (successResult) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 animate-fade-in">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-2xl shadow-md animate-bounce">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-navy-900">Application Submitted Successfully!</h1>
            <p className="text-sm text-slate-600">
              Your financing request has been securely received by <strong className="text-emerald-800">Merit Microfinance Bank Nigeria</strong>. Our credit team is reviewing your details.
            </p>
          </div>
          
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 text-left space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Application Reference</span>
              <p className="font-mono text-xl font-bold text-navy-900 mt-0.5">{successResult.reference}</p>
            </div>
            {successResult.tracking_code && (
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secure Tracking Code</span>
                <p className="font-mono text-base font-bold text-emerald-700 mt-0.5">{successResult.tracking_code}</p>
                <p className="text-[11px] text-amber-800 font-medium mt-1">⚠️ Save this code now. You will need it to check status.</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Button className="bg-emerald-800 hover:bg-emerald-900 text-white py-3 px-6 shadow-md transition-transform hover:scale-105" onClick={() => navigate(`/track?ref=${successResult.reference}`)}>Track Application Status →</Button>
            <Button variant="secondary" onClick={() => navigate('/')} className="py-3 px-6">Return Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Animated Hero Header */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-navy-900 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/60 px-4 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-600/40 shadow-inner">
              <span>🏛️ Merit Microfinance Bank Nigeria</span>
              <span>•</span>
              <span>Digital Credit Operations</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Let's take the next step together.</h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
              Empowering ambitious Nigerian entrepreneurs, salary earners, and growing enterprises with seamless financing solutions.
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side: Interactive Step Tracker */}
          <div className="lg:col-span-1 space-y-4 sticky top-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Application Journey</span>
                <h2 className="text-lg font-extrabold text-navy-900 mt-1">Step {currentStep} of 5</h2>
                <p className="text-xs text-slate-500 mt-0.5">{STEPS[currentStep - 1].title}</p>
              </div>

              <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
                {STEPS.map((step) => {
                  const isCompleted = currentStep > step.id
                  const isCurrent = currentStep === step.id
                  return (
                    <div 
                      key={step.id} 
                      onClick={() => step.id < currentStep && changeStep(step.id)}
                      className={`flex items-start gap-3 relative z-10 transition-all ${step.id < currentStep ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-700 text-white shadow-md' :
                        isCurrent ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 scale-105 shadow-md' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : step.id}
                      </div>
                      <div className="pt-1">
                        <p className={`text-xs font-bold transition-colors ${isCurrent ? 'text-navy-900 text-sm' : 'text-slate-500'}`}>{step.title}</p>
                        <p className="text-[11px] text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-xs text-emerald-950 space-y-1 shadow-sm">
                <p className="font-semibold flex items-center gap-1.5"><span>🔒</span> NDPR Compliant Security</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">All information and files are securely encrypted and processed exclusively for credit evaluation.</p>
              </div>
            </div>

            <div className="text-center lg:text-left px-2">
              <span className="text-xs text-slate-500">Already applied? </span>
              <button onClick={() => navigate('/track')} className="text-xs font-bold text-emerald-700 hover:underline inline-block">
                Track status with reference code →
              </button>
            </div>
          </div>

          {/* Right Side: Dynamic Form Card */}
          <div className="lg:col-span-2">
            <form onSubmit={handleNext} className={`rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl shadow-slate-100 space-y-6 transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`} noValidate>
              {error && <Alert tone="error">{error}</Alert>}

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-navy-900">1. Personal & Contact Information</h2>
                    <p className="text-xs text-slate-500 mt-1">Let's start with the basic details we need to identify your account.</p>
                  </div>

                  <TextField 
                    label="Full Legal Name" 
                    required 
                    placeholder="e.g. Adebayo Ogunlesi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField 
                      label="Phone Number (Mobile / WhatsApp)" 
                      required 
                      placeholder="e.g. 08030000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <TextField 
                      label="Email Address" 
                      type="email"
                      placeholder="e.g. adebayo@meritmfb.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <TextAreaField 
                    label="Residential Address" 
                    required 
                    placeholder="House number, street, city, state..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-navy-900">2. Employment & Financial Profile</h2>
                    <p className="text-xs text-slate-500 mt-1">Tell us about your earnings to calculate your borrowing capacity.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField 
                      label="Employment Type" 
                      required
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                    >
                      <option value="salaried">Salaried Employee</option>
                      <option value="self_employed">Self Employed</option>
                      <option value="small_business">Small Business Owner</option>
                      <option value="other">Other</option>
                    </SelectField>

                    <TextField 
                      label="Employer or Business Name" 
                      placeholder="Company or business name"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField 
                      label="Estimated Monthly Income (NGN)" 
                      type="number" 
                      required
                      placeholder="e.g. 200000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                    />
                    <TextField 
                      label="Estimated Monthly Expenses (NGN)" 
                      type="number"
                      placeholder="e.g. 70000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                    />
                  </div>

                  {monthlyIncome && !isNaN(Number(monthlyIncome)) && (
                    <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 text-xs text-emerald-950 flex justify-between items-center shadow-sm">
                      <span className="font-medium">Verified Monthly Inflow Reference:</span>
                      <strong className="text-emerald-800 text-sm font-mono">{formatNaira(Number(monthlyIncome))}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-navy-900">3. Loan Request & Terms</h2>
                    <p className="text-xs text-slate-500 mt-1">Choose an available microfinance credit product and repayment duration.</p>
                  </div>

                  <SelectField 
                    label="Loan Product" 
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatNaira(p.min_amount)} - {formatNaira(p.max_amount)})
                      </option>
                    ))}
                  </SelectField>

                  {selectedProductData && (
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <p><strong>Interest Rate:</strong> {selectedProductData.annual_interest_pct}% per annum ({selectedProductData.interest_method})</p>
                      <p><strong>Term Limits:</strong> {selectedProductData.min_term_months} to {selectedProductData.max_term_months} months</p>
                      {selectedProductData.eligibility_notes && <p className="text-emerald-800 mt-1"><strong>Requirement:</strong> {selectedProductData.eligibility_notes}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField 
                      label="Requested Amount (NGN)" 
                      type="number" 
                      required
                      placeholder="e.g. 300000"
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(e.target.value)}
                    />
                    <TextField 
                      label="Requested Term (Months)" 
                      type="number" 
                      required
                      placeholder="6"
                      value={requestedTerm}
                      onChange={(e) => setRequestedTerm(e.target.value)}
                    />
                  </div>

                  {requestedAmount && !isNaN(Number(requestedAmount)) && (
                    <div className="rounded-2xl bg-emerald-900 text-white p-4 text-sm flex justify-between items-center shadow-md">
                      <span>Total Principal Requested:</span>
                      <strong className="text-lg font-mono text-emerald-200">{formatNaira(Number(requestedAmount))}</strong>
                    </div>
                  )}

                  <TextAreaField 
                    label="Purpose of Loan" 
                    required 
                    placeholder="Provide details on how the funds will be utilized..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-navy-900">4. Supporting Verification Documents</h2>
                    <p className="text-xs text-slate-500 mt-1">Upload files for OCR text verification and credit officer review.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60 space-y-2 hover:border-emerald-600 transition-colors">
                      <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">Government Issued ID (Required)</label>
                      <p className="text-[11px] text-slate-500">National ID card, Voter's card, Driver's licence, or International Passport.</p>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                      />
                      {idFile && <p className="text-xs text-emerald-700 font-semibold pt-1">✓ Attached: {idFile.name}</p>}
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60 space-y-2 hover:border-emerald-600 transition-colors">
                      <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">Proof of Address</label>
                      <p className="text-[11px] text-slate-500">Recent electricity or utility bill confirming your residence.</p>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                      />
                      {addressFile && <p className="text-xs text-emerald-700 font-semibold pt-1">✓ Attached: {addressFile.name}</p>}
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60 space-y-2 hover:border-emerald-600 transition-colors">
                      <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">Bank Statement / Turnover</label>
                      <p className="text-[11px] text-slate-500">Last 3-6 months bank statement or commercial record.</p>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBankFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                      />
                      {bankFile && <p className="text-xs text-emerald-700 font-semibold pt-1">✓ Attached: {bankFile.name}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-navy-900">5. Summary & Authorization</h2>
                    <p className="text-xs text-slate-500 mt-1">Review your summary details before final transmission to Merit MFBn.</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 space-y-4 text-xs shadow-inner">
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px]">Applicant Name</span>
                        <p className="font-bold text-navy-900 text-sm mt-0.5">{fullName || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px]">Phone Contact</span>
                        <p className="font-bold text-navy-900 text-sm mt-0.5">{phone || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px]">Selected Product</span>
                        <p className="font-bold text-emerald-800 text-sm mt-0.5">{selectedProductData?.name || 'Micro Loan'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px]">Requested Amount</span>
                        <p className="font-bold text-emerald-800 text-sm mt-0.5">{requestedAmount ? formatNaira(Number(requestedAmount)) : '₦0'}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider block font-bold text-[10px]">Attached Verification Files</span>
                      <p className="font-medium text-navy-900 mt-0.5">
                        {[idFile && 'Government ID', addressFile && 'Proof of Address', bankFile && 'Bank Statement'].filter(Boolean).join(', ') || 'No files attached'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed">
                      I authorize <strong>Merit Microfinance Bank Nigeria</strong> to verify my identity, review credit bureau reports, and process the application details in compliance with regulatory standards.
                    </label>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button type="button" variant="secondary" onClick={handlePrev} className="px-6 py-2.5 rounded-xl">
                    ← Previous Step
                  </Button>
                ) : <div />}

                {currentStep < 5 ? (
                  <Button type="submit" className="bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3 rounded-xl shadow-md transition-transform hover:scale-105">
                    Continue to Next Step →
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    loading={submitting} 
                    onClick={handleFinalSubmit}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white px-10 py-3.5 text-base rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Submit Loan Application 🚀
                  </Button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}