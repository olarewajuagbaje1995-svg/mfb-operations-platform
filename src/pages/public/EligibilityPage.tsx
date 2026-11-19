import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  FolderOpen,
  IdCard,
  ShieldCheck,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'

const ELIGIBILITY_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556742502-ec7c0e94721c?auto=format&fit=crop&w=1400&q=80',
    alt: 'SME business owner preparing financing documentation',
  },
  {
    url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
    alt: 'Reviewing business bank statements and financial records',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&q=80',
    alt: 'Confident Nigerian entrepreneur ready to apply for business financing',
  },
]

const GENERAL_REQUIREMENTS = [
  'Registered business operating in Nigeria.',
  'Verifiable business operations and physical location.',
  'Valid government-issued identification for the business owner(s).',
  'Business bank statements or verifiable financial records.',
  'Applicant meets the product-specific credit and affordability assessment.',
]

const DOCUMENT_CATEGORIES = [
  {
    icon: IdCard,
    title: 'Identity Documents',
    items: [
      "Government-issued ID (National ID, Voter's card, Driver's licence or International Passport).",
      'BVN (Bank Verification Number) where applicable.',
    ],
  },
  {
    icon: Building2,
    title: 'Business Documents',
    items: [
      'Business registration documents (CAC certificate or business name registration).',
      'Proof of business address (utility bill or tenancy agreement).',
      'Tax clearance certificate where applicable.',
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Financial Documents',
    items: [
      'Business bank statements (last 3–6 months).',
      'Financial records or audited accounts where available.',
    ],
  },
  {
    icon: FolderOpen,
    title: 'Supporting Documents',
    items: [
      'Vendor quotation or proforma invoice (Equipment Finance).',
      'Collateral ownership documents (Asset-Backed Finance).',
      'Any additional documents requested during credit review.',
    ],
  },
]

const CHECKLIST_ITEMS = [
  'Business registration certificate',
  'Valid government-issued ID',
  'Proof of business address',
  'Bank statements (last 3–6 months)',
  'Completed application form',
] as const

export default function EligibilityPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ELIGIBILITY_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const toggleChecklistItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-[#101828]">
      <SEO
        title="Eligibility | CLOBANS FINANCE"
        description="Check the eligibility requirements for CLOBANS FINANCE SME financing products before you apply."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {ELIGIBILITY_SLIDES.map((slide, index) => (
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

        {/* Angled bright corporate-blue panel */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] lg:block"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
          }}
        />

        {/* Diagonal royal-blue accent stripe */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[48%] hidden w-24 bg-[#1D72E8]/35 lg:block"
          style={{
            clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Who Can Apply?
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                Eligibility
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Requirements.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Find out if your business qualifies for CLOBANS FINANCE
                financing and review the documents needed for a smooth
                application.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Start Your Application</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-60 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {ELIGIBILITY_SLIDES.map((slide, index) => (
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

          {/* Slide Dots */}
          <div className="mt-6 flex items-center justify-center gap-2 lg:absolute lg:bottom-6 lg:right-8 lg:mt-0">
            {ELIGIBILITY_SLIDES.map((_, index) => (
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
          2. GENERAL REQUIREMENTS
      ========================================= */}
      <section className="bg-[#F1F6FE] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B2F5B]">
                GENERAL REQUIREMENTS
              </span>
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
            </div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-[#061E45] sm:text-3xl lg:text-4xl">
              Who Can Apply?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475467]">
              Financing is available to registered Nigerian businesses that meet
              our responsible lending criteria.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GENERAL_REQUIREMENTS.map((item, idx) => (
              <div
                key={item}
                className="group flex items-start gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FD] font-mono text-sm font-extrabold text-[#0B2F5B] transition-colors group-hover:bg-[#FFD036] group-hover:text-[#061E45]">
                  0{idx + 1}
                </span>
                <p className="text-sm font-medium leading-6 text-[#344054]">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#DCE5F1] bg-white/80 p-4 text-xs leading-6 text-[#475467]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2F5B]" />
            <p>
              Exact requirements vary by product. Product-specific criteria are
              listed on each financing product page and confirmed during
              application review.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          3. DOCUMENTS YOU WILL NEED
      ========================================= */}
      <section className="border-y border-[#DCE5F1] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
              DOCUMENTATION
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#061E45] sm:text-3xl lg:text-4xl">
              Documents You Will Need
            </h2>
            <p className="mt-3 text-base text-[#475467]">
              Prepare these documents before starting your application for a
              faster review.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DOCUMENT_CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.title}
                  className="group rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B] transition-colors group-hover:bg-[#FFD036] group-hover:text-[#061E45]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-heading text-base font-extrabold text-[#061E45]">
                    {category.title}
                  </h3>

                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#475467]">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#F5B927]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          4. INTERACTIVE APPLICATION CHECKLIST + CTA
      ========================================= */}
      <section className="bg-[#F1F6FE] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-8 shadow-2xl sm:p-12 lg:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] !text-[#FFD036]">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span style={{ color: '#FFD036' }}>Ready to Apply?</span>
                </div>

                <h2
                  className="mt-4 font-heading text-3xl font-extrabold !text-white sm:text-4xl"
                  style={{ color: '#FFFFFF' }}
                >
                  Application Checklist
                </h2>

                <p
                  className="mt-3 text-sm leading-6 !text-white/90"
                  style={{ color: '#EAF2FD' }}
                >
                  Tick off the items you already have ready. Once you&apos;re
                  set, jump right into the online application.
                </p>

                <p
                  className="mt-4 text-xs font-bold !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  {checkedItems.length} of {CHECKLIST_ITEMS.length} items ready
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/apply"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066]"
                    style={{ color: '#061E45' }}
                  >
                    <span>Start Your Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ul className="space-y-3">
                  {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = checkedItems.includes(item)
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => toggleChecklistItem(item)}
                          className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                            isChecked
                              ? 'border-[#FFD036] bg-white/15'
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              isChecked
                                ? 'border-[#FFD036] bg-[#FFD036] text-[#061E45]'
                                : 'border-white/50 bg-transparent text-transparent'
                            }`}
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                          <span
                            className={`text-sm font-semibold !text-white ${
                              isChecked ? 'line-through opacity-80' : ''
                            }`}
                            style={{ color: '#FFFFFF' }}
                          >
                            {item}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}