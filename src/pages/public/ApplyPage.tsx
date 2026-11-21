import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileUp,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import {
  getPublicOrg,
  getActiveProducts,
  submitApplication,
} from '@/services/publicApi'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/Field'
import { Alert, Spinner } from '@/components/feedback'
import { SEO } from '@/components/seo/SEO'
import { formatNaira } from '@/utils/format'
import { runOCR, extractOcrFields } from '@/utils/ocr'
import { calculateLoan } from '@/utils/loanCalculator'

const APPLY_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1400&q=80',
    alt: 'SME business owner applying for growth financing',
  },
  {
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80',
    alt: 'Entrepreneur reviewing financing terms and loan application',
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80',
    alt: 'Business team planning expansion with CLOBANS FINANCE',
  },
]

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
  const [currentSlide, setCurrentSlide] = useState(0)

  // Wizard Step State
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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % APPLY_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

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

  function interestMethodLabel(method: string | undefined) {
    return method === 'reducing_balance' ? 'Reducing Balance' : 'Flat Rate'
  }

  const repaymentCalculation =
    selectedProductData && Number(requestedAmount) > 0 && Number(requestedTerm) > 0
      ? calculateLoan(
          Number(requestedAmount),
          selectedProductData.annual_interest_pct,
          Number(requestedTerm),
          selectedProductData.interest_method,
          selectedProductData.fee_pct,
        )
      : null

  function changeStep(targetStep: number) {
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep(targetStep)
      setAnimating(false)
      window.scrollTo({ top: 140, behavior: 'smooth' })
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
        if (
          amt < selectedProductData.min_amount ||
          amt > selectedProductData.max_amount
        ) {
          setError(
            `Requested amount must be between ${formatNaira(
              selectedProductData.min_amount
            )} and ${formatNaira(selectedProductData.max_amount)}.`
          )
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
      setError(
        'You must accept the privacy and credit check consent declarations to proceed.'
      )
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
        customer_type: customerType as
          | 'salaried'
          | 'self_employed'
          | 'small_business'
          | 'other',
        employer_or_business: employer || undefined,
        monthly_income: Number(monthlyIncome),
        monthly_expenses: monthlyExpenses ? Number(monthlyExpenses) : 0,
        loan_product_id: productId,
        requested_amount: Number(requestedAmount),
        requested_term_months: Number(requestedTerm),
        purpose,
        consent_given: consent,
      }

      // 1. Submit application to create parent record & get application ID
      const result = await submitApplication(org.slug, idempotencyKey, payload)
      const appId = result.application_id

      const filesToUpload = [
        { file: idFile, category: 'government_id' },
        { file: addressFile, category: 'proof_of_address' },
        { file: bankFile, category: 'bank_statement' },
      ]

      // 2. Process files, run local OCR, and insert records
      for (const item of filesToUpload) {
        if (item.file) {
          let extractedText = ''
          let parsedData: {
            suggested_expiry: string | null
            suggested_name: string | null
          } = {
            suggested_expiry: null,
            suggested_name: null,
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

          const { error: storageError } = await supabase.storage
            .from('documents')
            .upload(fileName, item.file)

          if (storageError) throw storageError

          const { error: dbError } = await supabase
            .from('application_documents')
            .insert({
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F1F6FE]">
        <Spinner label="Loading application portal..." />
      </div>
    )
  }

  if (successResult) {
    return (
      <main className="min-h-screen bg-[#F1F6FE] px-4 py-16">
        <SEO
          title="Application Submitted | CLOBANS FINANCE"
          description="Your financing application has been submitted to CLOBANS FINANCE."
        />
        <div className="mx-auto max-w-xl">
          <div className="space-y-6 rounded-3xl border border-[#DCE5F1] bg-white p-8 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD036] text-[#061E45] shadow-md">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-extrabold text-[#061E45]">
                Application Submitted Successfully!
              </h1>
              <p className="text-sm leading-6 text-[#475467]">
                Your financing request has been securely received by{' '}
                <strong className="text-[#0B2F5B]">CLOBANS FINANCE</strong>. Our
                credit team is reviewing your details.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE]/70 p-6 text-left">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#667085]">
                  Application Reference
                </span>
                <p className="mt-0.5 font-mono text-xl font-extrabold text-[#061E45]">
                  {successResult.reference}
                </p>
              </div>
              {successResult.tracking_code && (
                <div className="border-t border-[#DCE5F1] pt-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#667085]">
                    Secure Tracking Code
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-[#0052B4]">
                    {successResult.tracking_code}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#8A6100]">
                    Save this code now. You will need it to check your status.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Button
                className="rounded-xl bg-[#FFD036] px-6 py-3 text-sm font-extrabold !text-[#061E45] shadow-md hover:bg-[#FFE066]"
                style={{ color: '#061E45' }}
                onClick={() =>
                  navigate(`/track?ref=${successResult.reference}`)
                }
              >
                Track Application Status →
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/')}
                className="rounded-xl px-6 py-3"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F1F6FE] pb-24 font-sans text-[#101828]">
      <SEO
        title="Apply for Financing | CLOBANS FINANCE"
        description="Complete your online SME or personal financing application with CLOBANS FINANCE in five simple steps."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {APPLY_HERO_SLIDES.map((slide, index) => (
            <img
              key={slide.url}
              src={slide.url}
              alt={slide.alt}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#072452] via-[#072452]/45 to-transparent" />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] lg:block"
          style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }}
        />

        <div
          className="pointer-events-none absolute inset-y-0 left-[48%] hidden w-24 bg-[#1D72E8]/35 lg:block"
          style={{ clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  CLOBANS FINANCE • Digital Credit Portal
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[52px]"
                style={{ color: '#FFFFFF' }}
              >
                Let&apos;s Take the Next
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Step Together.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Empowering ambitious Nigerian entrepreneurs, salary earners, and
                growing enterprises with fast, transparent financing solutions.
              </p>
            </div>

            <div className="relative h-56 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {APPLY_HERO_SLIDES.map((slide, index) => (
                <img
                  key={slide.url}
                  src={slide.url}
                  alt={slide.alt}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 lg:absolute lg:bottom-6 lg:right-8 lg:mt-0">
            {APPLY_HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-7 bg-[#FFD036]'
                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          2. APPLICATION WIZARD
      ========================================= */}
      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* LEFT: INTERACTIVE STEP TRACKER */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-1">
            <div className="space-y-6 rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#B8840A]">
                  Application Journey
                </span>
                <h2 className="mt-1 font-heading text-lg font-extrabold text-[#061E45]">
                  Step {currentStep} of 5
                </h2>
                <p className="mt-0.5 text-xs font-medium text-[#475467]">
                  {STEPS[currentStep - 1].title}
                </p>
              </div>

              <div className="relative space-y-3.5 before:absolute before:bottom-3 before:left-4 before:top-3 before:w-0.5 before:bg-[#E2ECF9]">
                {STEPS.map((step) => {
                  const isCompleted = currentStep > step.id
                  const isCurrent = currentStep === step.id
                  return (
                    <div
                      key={step.id}
                      onClick={() => step.id < currentStep && changeStep(step.id)}
                      className={`relative z-10 flex items-start gap-3 transition-all ${
                        step.id < currentStep
                          ? 'cursor-pointer hover:opacity-85'
                          : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#FFD036] text-[#061E45] shadow-sm'
                            : isCurrent
                              ? 'scale-105 bg-[#0B2F5B] text-white shadow-md ring-4 ring-[#FFD036]/40'
                              : 'border border-[#DCE5F1] bg-[#F8FAFD] text-[#667085]'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p
                          className={`text-xs font-extrabold transition-colors ${
                            isCurrent
                              ? 'text-sm text-[#061E45]'
                              : isCompleted
                                ? 'text-[#0B2F5B]'
                                : 'text-[#667085]'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-[#667085]">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-1.5 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE] p-4 text-xs">
                <p className="flex items-center gap-1.5 font-extrabold text-[#061E45]">
                  <Lock className="h-3.5 w-3.5 text-[#0B2F5B]" />
                  <span>NDPR Compliant Security</span>
                </p>
                <p className="text-[11px] leading-relaxed text-[#475467]">
                  All information and files are securely encrypted and processed
                  exclusively for credit evaluation.
                </p>
              </div>
            </div>

            <div className="px-2 text-center lg:text-left">
              <span className="text-xs text-[#475467]">Already applied? </span>
              <button
                type="button"
                onClick={() => navigate('/track')}
                className="inline-block text-xs font-extrabold text-[#0052B4] hover:underline"
              >
                Track status with reference code →
              </button>
            </div>
          </aside>

          {/* RIGHT: DYNAMIC FORM CARD */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleNext}
              className={`space-y-6 rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm transition-all duration-300 sm:p-10 ${
                animating
                  ? 'translate-y-2 opacity-0'
                  : 'translate-y-0 opacity-100'
              }`}
              noValidate
            >
              {error && <Alert tone="error">{error}</Alert>}

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-[#DCE5F1] pb-4">
                    <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                      1. Personal &amp; Contact Information
                    </h2>
                    <p className="mt-1 text-xs text-[#475467]">
                      Let&apos;s start with the basic details we need to
                      identify your account.
                    </p>
                  </div>

                  <TextField
                    label="Full Legal Name"
                    required
                    placeholder="e.g. Adebayo Ogunlesi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      placeholder="e.g. adebayo@clobansfinance.com"
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
                  <div className="border-b border-[#DCE5F1] pb-4">
                    <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                      2. Employment &amp; Financial Profile
                    </h2>
                    <p className="mt-1 text-xs text-[#475467]">
                      Tell us about your earnings to calculate your borrowing
                      capacity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Employment Type"
                      required
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                    >
                      <option value="salaried">Salaried Employee</option>
                      <option value="self_employed">Self Employed</option>
                      <option value="small_business">
                        Small Business Owner
                      </option>
                      <option value="other">Other</option>
                    </SelectField>

                    <TextField
                      label="Employer or Business Name"
                      placeholder="Company or business name"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div className="flex items-center justify-between rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE] p-4 text-xs text-[#061E45]">
                      <span className="font-semibold">
                        Verified Monthly Inflow Reference:
                      </span>
                      <strong className="font-mono text-sm font-extrabold text-[#0052B4]">
                        {formatNaira(Number(monthlyIncome))}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-[#DCE5F1] pb-4">
                    <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                      3. Loan Request &amp; Terms
                    </h2>
                    <p className="mt-1 text-xs text-[#475467]">
                      Choose an available financing product and repayment
                      duration.
                    </p>
                  </div>

                  <SelectField
                    label="Loan Product"
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatNaira(p.min_amount)} -{' '}
                        {formatNaira(p.max_amount)})
                      </option>
                    ))}
                  </SelectField>

                  {selectedProductData && (
                    <div className="space-y-1.5 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-4 text-xs text-[#344054]">
                      <p>
                        <strong>Interest Rate:</strong>{' '}
                        {selectedProductData.annual_interest_pct}% per annum (
                        {selectedProductData.interest_method})
                      </p>
                      <p>
                        <strong>Term Limits:</strong>{' '}
                        {selectedProductData.min_term_months} to{' '}
                        {selectedProductData.max_term_months} months
                      </p>
                      {selectedProductData.eligibility_notes && (
                        <p className="mt-1 font-medium text-[#8A6100]">
                          <strong>Requirement:</strong>{' '}
                          {selectedProductData.eligibility_notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#072452] to-[#0052B4] p-4 text-sm text-white shadow-md">
                      <span className="font-semibold">
                        Total Principal Requested:
                      </span>
                      <strong className="font-mono text-lg font-extrabold text-[#FFD036]">
                        {formatNaira(Number(requestedAmount))}
                      </strong>
                    </div>
                  )}

                  {repaymentCalculation && (
                    <div className="mt-4 rounded-2xl border border-[#DCE5F1] bg-white p-4 sm:p-6 shadow-sm">
                      <div className="mb-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#061E45]">
                            Estimated Repayment Breakdown
                          </h3>
                          <p className="text-[11px] text-[#667085]">
                            Live estimate from the selected product's rate,
                            method, and processing fee.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#DCE5F1] bg-[#F1F6FE]/60 p-3">
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Principal
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {formatNaira(repaymentCalculation.principal)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#DCE5F1] bg-[#F1F6FE]/60 p-3">
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Interest Rate &amp; Method
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {selectedProductData.annual_interest_pct}% p.a. (
                            {interestMethodLabel(selectedProductData.interest_method)})
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#DCE5F1] bg-[#F1F6FE]/60 p-3">
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Estimated Interest
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {formatNaira(repaymentCalculation.totalInterest)}
                          </p>
                        </div>
                        {repaymentCalculation.processingFee > 0 && (
                          <div className="rounded-xl border border-[#DCE5F1] bg-[#F1F6FE]/60 p-3">
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                              Processing Fee
                            </span>
                            <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                              {formatNaira(repaymentCalculation.processingFee)}
                            </p>
                          </div>
                        )}
                        <div className="rounded-xl border border-[#DCE5F1] bg-[#F1F6FE]/60 p-3 sm:col-span-2">
                          <div className="flex items-baseline justify-between text-sm">
                            <span className="font-extrabold uppercase tracking-wider text-[#667085]">
                              Estimated Monthly Repayment
                            </span>
                            <p className="font-mono font-extrabold text-[#061E45]">
                              {formatNaira(repaymentCalculation.monthlyRepayment)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border-2 border-[#0B2F5B] bg-[#061E45] p-3 sm:col-span-2">
                          <div className="flex items-baseline justify-between text-sm">
                            <span className="font-extrabold uppercase tracking-wider text-[#FFD036]">
                              Total Repayment
                            </span>
                            <p className="font-mono font-extrabold text-[#FFD036]">
                              {formatNaira(repaymentCalculation.totalRepayment)}
                            </p>
                          </div>
                        </div>
                      </div>
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
                  <div className="border-b border-[#DCE5F1] pb-4">
                    <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                      4. Supporting Verification Documents
                    </h2>
                    <p className="mt-1 text-xs text-[#475467]">
                      Upload files for OCR text verification and credit officer
                      review.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        label: 'Government Issued ID (Required)',
                        help: "National ID card, Voter's card, Driver's licence, or International Passport.",
                        file: idFile,
                        onChange: (f: File | null) => setIdFile(f),
                      },
                      {
                        label: 'Proof of Address',
                        help: 'Recent electricity or utility bill confirming your residence.',
                        file: addressFile,
                        onChange: (f: File | null) => setAddressFile(f),
                      },
                      {
                        label: 'Bank Statement / Turnover',
                        help: 'Last 3–6 months bank statement or commercial record.',
                        file: bankFile,
                        onChange: (f: File | null) => setBankFile(f),
                      },
                    ].map((doc) => (
                      <div
                        key={doc.label}
                        className="space-y-2.5 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-5 transition-colors hover:border-[#F5B927]"
                      >
                        <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#061E45]">
                          <FileUp className="h-4 w-4 text-[#0052B4]" />
                          <span>{doc.label}</span>
                        </label>
                        <p className="text-[11px] text-[#475467]">{doc.help}</p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            doc.onChange(e.target.files?.[0] || null)
                          }
                          className="w-full cursor-pointer text-xs text-[#475467] file:mr-4 file:rounded-xl file:border-0 file:bg-[#0B2F5B] file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#0052B4]"
                        />
                        {doc.file && (
                          <p className="flex items-center gap-1.5 pt-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Attached: {doc.file.name}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-[#DCE5F1] pb-4">
                    <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                      5. Summary &amp; Authorization
                    </h2>
                    <p className="mt-1 text-xs text-[#475467]">
                      Review your summary details before final transmission to
                      CLOBANS FINANCE.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE]/70 p-6 text-xs">
                    <div className="grid grid-cols-1 gap-4 border-b border-[#DCE5F1] pb-3 sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                          Applicant Name
                        </span>
                        <p className="mt-0.5 text-sm font-extrabold text-[#061E45]">
                          {fullName || '—'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                          Phone Contact
                        </span>
                        <p className="mt-0.5 text-sm font-extrabold text-[#061E45]">
                          {phone || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-b border-[#DCE5F1] pb-3 sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                          Selected Product
                        </span>
                        <p className="mt-0.5 text-sm font-extrabold text-[#0052B4]">
                          {selectedProductData?.name || 'Financing Facility'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                          Requested Amount
                        </span>
                        <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                          {requestedAmount
                            ? formatNaira(Number(requestedAmount))
                            : '₦0'}
                        </p>
                      </div>
                    </div>

                    {repaymentCalculation && (
                      <div className="grid grid-cols-1 gap-4 border-b border-[#DCE5F1] pb-3 sm:grid-cols-3">
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Repayment Term
                          </span>
                          <p className="mt-0.5 text-sm font-extrabold text-[#061E45]">
                            {requestedTerm} months
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Interest Rate &amp; Method
                          </span>
                          <p className="mt-0.5 text-sm font-extrabold text-[#061E45]">
                            {selectedProductData.annual_interest_pct}% p.a. (
                            {interestMethodLabel(selectedProductData.interest_method)})
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Estimated Interest
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {formatNaira(repaymentCalculation.totalInterest)}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Estimated Monthly Repayment
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {formatNaira(repaymentCalculation.monthlyRepayment)}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                            Total Repayment
                          </span>
                          <p className="mt-0.5 font-mono text-sm font-extrabold text-[#061E45]">
                            {formatNaira(repaymentCalculation.totalRepayment)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                        Attached Verification Files
                      </span>
                      <p className="mt-0.5 font-semibold text-[#061E45]">
                        {[
                          idFile && 'Government ID',
                          addressFile && 'Proof of Address',
                          bankFile && 'Bank Statement',
                        ]
                          .filter(Boolean)
                          .join(', ') || 'No files attached'}
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="consent"
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-4"
                  >
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-[#0B2F5B] focus:ring-[#FFD036]"
                    />
                    <span className="text-xs leading-relaxed text-[#475467]">
                      I authorize{' '}
                      <strong className="text-[#061E45]">
                        CLOBANS FINANCE
                      </strong>{' '}
                      to verify my identity, review credit bureau reports, and
                      process my application details in compliance with
                      regulatory standards.
                    </span>
                  </label>
                </div>
              )}

              {/* FORM NAVIGATION CONTROLS */}
              <div className="flex items-center justify-between border-t border-[#DCE5F1] pt-6">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous Step</span>
                  </Button>
                ) : (
                  <div className="hidden items-center gap-1.5 text-xs font-semibold text-[#667085] sm:flex">
                    <ShieldCheck className="h-4 w-4 text-[#0B2F5B]" />
                    <span>Encrypted Application</span>
                  </div>
                )}

                {currentStep < 5 ? (
                  <Button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-7 py-3 text-sm font-extrabold !text-[#061E45] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#FFE066]"
                    style={{ color: '#061E45' }}
                  >
                    <span>Continue to Next Step</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    loading={submitting}
                    onClick={handleFinalSubmit}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-8 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                    style={{ color: '#061E45' }}
                  >
                    <span>Submit Loan Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}