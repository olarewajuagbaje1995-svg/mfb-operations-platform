import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FileUp,
  Layers,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { brand } from '@/config/brand'

const HOW_IT_WORKS_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80',
    alt: 'Business owner reviewing financing options and financial documents',
  },
  {
    url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
    alt: 'Successful business financing partnership handshake',
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80',
    alt: 'Credit advisors reviewing SME financing applications',
  },
]

const PROCESS_STEPS = [
  {
    number: '01',
    icon: Layers,
    title: 'Choose a Financing Product',
    description:
      'Explore our financing solutions — SME Business Loans, Asset-Backed Finance, Equipment Finance or Working Capital Finance — and pick the one that matches your needs.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Check Your Eligibility',
    description:
      'Review the general requirements and product-specific criteria, then prepare your business and identity documents.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Complete the Application',
    description:
      'Fill out our online application with your personal, business and financing details. It takes only a few minutes.',
  },
  {
    number: '04',
    icon: FileUp,
    title: 'Upload Supporting Documents',
    description:
      'Securely upload your identification, business and financial documents through our application portal.',
  },
  {
    number: '05',
    icon: ShieldCheck,
    title: 'Application Review',
    description:
      'Our credit team reviews your application, verifies your documents and assesses affordability.',
  },
  {
    number: '06',
    icon: CheckCircle2,
    title: 'Financing Decision',
    description:
      'Receive communication on the outcome of your application and next steps, including disbursement details if approved.',
  },
]

export default function HowItWorksPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HOW_IT_WORKS_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-[#101828]">
      <SEO
        title="How It Works | CLOBANS FINANCE"
        description="Understand the CLOBANS FINANCE application journey — from choosing a product to receiving a financing decision."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {HOW_IT_WORKS_SLIDES.map((slide, index) => (
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
                  Your Growth Journey
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                Your Business Growth
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Journey Starts Here.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                A clear, transparent six-step process from choosing the right
                financing product to receiving your financing decision.
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
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <Search className="h-4 w-4" />
                  <span>Track Application</span>
                </Link>
              </div>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-60 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {HOW_IT_WORKS_SLIDES.map((slide, index) => (
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
            {HOW_IT_WORKS_SLIDES.map((_, index) => (
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
          2. SIX STEPS TO FINANCING (CLEAN 3x2 GRID)
      ========================================= */}
      <section className="bg-[#F1F6FE] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B2F5B]">
                {brand.name}
              </span>
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
            </div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-[#061E45] sm:text-3xl lg:text-4xl">
              Six Steps to Financing
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475467]">
              We keep the process structured and transparent so you always know
              what happens next while focusing on running your business.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#DCE5F1] bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B] transition-colors group-hover:bg-[#FFD036] group-hover:text-[#061E45]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-[#F1F6FE] px-3 py-1 font-mono text-xs font-extrabold text-[#0B2F5B] group-hover:bg-[#FFF9E6] group-hover:text-[#8A6100]">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="mt-6 font-heading text-lg font-extrabold text-[#061E45]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#475467]">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 h-1 w-12 rounded-full bg-[#DCE5F1] transition-all duration-200 group-hover:w-20 group-hover:bg-[#F5B927]" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          3. FINAL CALL TO ACTION
      ========================================= */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-10 text-center shadow-2xl sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="relative z-10">
              <p
                className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                style={{ color: '#FFD036' }}
              >
                Ready to Begin?
              </p>
              <h2
                className="mt-3 font-heading text-3xl font-extrabold !text-white sm:text-4xl"
                style={{ color: '#FFFFFF' }}
              >
                Start Your Financing Application Today
              </h2>
              <p
                className="mx-auto mt-4 max-w-xl text-base leading-7 !text-white/95"
                style={{ color: '#EAF2FD' }}
              >
                Check your eligibility or jump straight into our online
                application portal in minutes.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-7 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Start Your Application</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/eligibility"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-7 py-3.5 text-sm font-bold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <span>Check Eligibility First</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}