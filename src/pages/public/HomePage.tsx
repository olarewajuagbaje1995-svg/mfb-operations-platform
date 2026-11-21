import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Search,
  Check,
  ShieldCheck,
  Gauge,
  Users,
  Lock,
  Coins,
  Car,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { usePageSeo } from '@/hooks/usePageSeo'

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1400&q=80',
    alt: 'SME business owner assisting customer at retail counter',
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80',
    alt: 'Growing enterprise team planning business expansion',
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Warehouse logistics and working capital inventory operations',
  },
  {
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80',
    alt: 'Industrial equipment and machinery financing for SMEs',
  },
]

const BENEFIT_PILLS = [
  'Asset-Backed Loans',
  'Working Capital',
  'Equipment Finance',
  'Business Expansion',
]

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Trusted & Transparent',
    description: 'Clear terms, no hidden fees.',
  },
  {
    icon: Gauge,
    title: 'Fast Turnaround',
    description: 'Credit decisions in 24 – 48 hours.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Expert advisors to guide you.',
  },
  {
    icon: Lock,
    title: 'Secure & Compliant',
    description: 'Aligned with regulatory standards and data protection.',
  },
]

const FINANCING_PRODUCTS = [
  {
    id: 'sme-business-loans',
    title: 'SME Business Loans',
    description: 'Flexible financing to start, run or expand your business.',
    icon: Coins,
  },
  {
    id: 'asset-backed-finance',
    title: 'Asset-Backed Finance',
    description:
      'Access larger facilities using business or personal assets as collateral.',
    icon: Car,
  },
  {
    id: 'equipment-finance',
    title: 'Equipment Financing',
    description:
      'Acquire machinery, tools and other productive assets to grow your operations.',
    icon: Settings,
  },
  {
    id: 'working-capital',
    title: 'Working Capital Finance',
    description:
      'Keep your business running smoothly with short-term financing.',
    icon: TrendingUp,
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  usePageSeo({
    title: 'CLOBANS FINANCE | Fast, Transparent Microfinance & Loan Solutions',
    description:
      'Apply for fast, transparent salary advances, personal loans, and business financing with CLOBANS FINANCE. Instant repayment estimates and secure online applications.',
  })

  return (
    <main className="w-full overflow-x-hidden bg-white font-sans text-[#101828]">
      <SEO
        title="CLOBANS FINANCE | Empowering SMEs. Financing Growth."
        description="Accessible, responsible and transparent financing solutions for Nigerian businesses, entrepreneurs and growing enterprises."
      />

      {/* =========================================
          1. HERO SECTION WITH AUTO-SLIDING IMAGES
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side full-bleed sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[58%]">
          {HERO_SLIDES.map((slide, index) => (
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
          {/* Smooth blend on the left edge so the image stays bright on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#072452] via-[#072452]/40 to-transparent" />
        </div>

        {/* Brighter angled corporate-blue panel on the left */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56%] bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] lg:block"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
          }}
        />

        {/* Subtle royal-blue diagonal accent stripe */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[46%] hidden w-24 bg-[#1D72E8]/35 lg:block"
          style={{
            clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* LEFT COLUMN: Bright White & Gold Headline, Copy, Buttons */}
            <div className="lg:col-span-6">
              <h1
                className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                Empowering SMEs.
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Financing Growth.
                </span>
              </h1>

              <p
                className="mt-5 max-w-lg text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Accessible, responsible and transparent financing solutions for
                Nigerian businesses, entrepreneurs and growing enterprises.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FFD036] px-6 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>Apply for Financing →</span>
                </Link>

                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span>Track Application</span>
                </Link>
              </div>
            </div>

            {/* CENTER-RIGHT COLUMN: Staggered Floating Benefit Pills */}
            <div className="flex flex-col gap-3.5 lg:col-span-4 lg:pl-4">
              {BENEFIT_PILLS.map((label, index) => (
                <div
                  key={label}
                  className="flex w-fit items-center gap-3 rounded-xl border border-white/25 bg-[#0A2C5E]/90 px-4 py-2.5 shadow-xl backdrop-blur-md transition-transform duration-200 hover:translate-x-1"
                  style={{
                    marginLeft:
                      index === 0
                        ? '12px'
                        : index === 1
                          ? '6px'
                          : index === 2
                            ? '0px'
                            : '-6px',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFD036] text-[#061E45]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span
                    className="whitespace-nowrap text-sm font-bold !text-white sm:text-[15px]"
                    style={{ color: '#FFFFFF' }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile-only Auto-Sliding Hero Image */}
            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {HERO_SLIDES.map((slide, index) => (
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

          {/* Slide Indicator Dots (Bottom Right on Desktop) */}
          <div className="mt-6 flex items-center justify-center gap-2 lg:absolute lg:bottom-6 lg:right-8 lg:mt-0">
            {HERO_SLIDES.map((_, index) => (
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
          2. TRUST INDICATOR STRIP (WHITE)
      ========================================= */}
      <section className="border-b border-[#DCE5F1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#0B2F5B]">
                    <Icon className="h-8 w-8 stroke-[1.75]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#061E45]">
                      {item.title}
                    </h2>
                    <p className="mt-0.5 text-xs leading-5 text-[#475467]">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          3. OUR FINANCING SOLUTIONS (PALE BLUE)
      ========================================= */}
      <section className="bg-[#F1F6FE] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Eyebrow with flanking lines */}
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#93B4E2] sm:w-16" />
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B2F5B]">
              OUR FINANCING SOLUTIONS
            </span>
            <span className="h-px w-12 bg-[#93B4E2] sm:w-16" />
          </div>

          {/* Section Title */}
          <h2 className="mt-3 text-center font-heading text-2xl font-extrabold tracking-tight text-[#061E45] sm:text-3xl lg:text-4xl">
            Tailored Financing for Business Growth
          </h2>

          {/* 4 Product Cards */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FINANCING_PRODUCTS.map((product) => {
              const Icon = product.icon
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-[#E2ECF9] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-md"
                >
                  <div className="mt-1 shrink-0 text-[#F5B927] transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-10 w-10 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#061E45] group-hover:text-[#003061]">
                      {product.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-[#475467]">
                      {product.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}