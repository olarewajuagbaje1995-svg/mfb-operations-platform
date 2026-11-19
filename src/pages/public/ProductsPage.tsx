import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Search, X } from 'lucide-react'
import { getActiveProducts, getPublicOrg } from '@/services/publicApi'
import { supabase } from '@/lib/supabase'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { SEO } from '@/components/seo/SEO'
import { formatNaira } from '@/utils/format'

const PRODUCTS_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1400&q=80',
    alt: 'SME business owner managing retail store operations',
  },
  {
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80',
    alt: 'Equipment and machinery financing for growing enterprises',
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Working capital and inventory logistics for Nigerian businesses',
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loanTypes, setLoanTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PRODUCTS_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const org = await getPublicOrg('demo-mfb')
        const orgId = org?.id || 'demo-mfb'

        const [productsData, typesRes] = await Promise.all([
          getActiveProducts(orgId),
          supabase.from('loan_types').select('*'),
        ])

        setProducts(productsData || [])
        setLoanTypes(typesRes.data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load loan products.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Robust category resolver: If it's MSA-01 or Salary Advance, force "Salary"
  const getProductCategory = (p: any) => {
    if (
      p.code === 'MSA-01' ||
      (p.name && p.name.toLowerCase().includes('salary'))
    ) {
      return 'Salary'
    }
    return p.category || p.type || p.product_type || 'Salary'
  }

  // Build dynamic categories list
  const categoryNames = [
    ...loanTypes.map((t) => t.name?.trim()),
    ...products.map((p) => getProductCategory(p)?.trim()),
  ].filter(Boolean)

  const dynamicCategories = [
    'All Products',
    ...Array.from(new Set(categoryNames)),
  ]

  // Bulletproof filtering for category & search
  const filteredProducts = products.filter((product) => {
    const prodCat = getProductCategory(product).trim().toLowerCase()
    const selectedCat = selectedCategory.trim().toLowerCase()
    const q = searchQuery.toLowerCase().trim()

    if (q) {
      return (
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.code && product.code.toLowerCase().includes(q)) ||
        (product.description &&
          product.description.toLowerCase().includes(q)) ||
        prodCat.includes(q)
      )
    }

    if (selectedCat === 'all products') return true
    return prodCat === selectedCat
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F1F6FE]">
        <Spinner label="Loading available financing products..." />
      </div>
    )
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F1F6FE] pb-24 font-sans text-[#101828]">
      <SEO
        title="Our Products | CLOBANS FINANCE"
        description="Explore CLOBANS FINANCE SME business loans, asset-backed finance, equipment financing, and working capital solutions."
      />

      {/* =========================================
          SECTION 1: BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {PRODUCTS_HERO_SLIDES.map((slide, index) => (
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
                  CLOBANS FINANCE • Financing Solutions
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                Tailored Financing for
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Business Growth.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Empowering Nigerian businesses, entrepreneurs, and salary
                earners with fast, transparent, and responsible credit
                facilities built for every stage of growth.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#products-grid"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-7 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Explore Loan Products</span>
                  <ArrowDown className="h-4 w-4" />
                </a>

                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-60 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {PRODUCTS_HERO_SLIDES.map((slide, index) => (
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
            {PRODUCTS_HERO_SLIDES.map((_, index) => (
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
          SECTION 2 & 3: CATALOGUE, SEARCH & FILTERS
      ========================================= */}
      <div
        className="mx-auto mt-12 max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8"
        id="products-grid"
      >
        <div className="space-y-6 rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 border-b border-[#DCE5F1] pb-6 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
                Transparent Offers
              </span>
              <h2 className="mt-1 font-heading text-2xl font-extrabold text-[#061E45] sm:text-3xl">
                Explore Available Loans
              </h2>
              <p className="mt-1 text-xs text-[#475467] sm:text-sm">
                Search by keyword or select a financing category below.
              </p>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] py-3.5 pl-11 pr-10 text-xs font-medium text-[#101828] transition-all focus:border-[#0052B4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052B4]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#667085] hover:text-[#061E45]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Category Filter Pills */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {dynamicCategories.map((cat) => {
              const isActive =
                selectedCategory.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat)
                    setSearchQuery('')
                  }}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold capitalize transition-all duration-200 ${
                    isActive
                      ? 'scale-105 bg-[#0B2F5B] !text-white shadow-md ring-2 ring-[#FFD036]'
                      : 'border border-[#DCE5F1] bg-white text-[#475467] hover:-translate-y-0.5 hover:border-[#F5B927] hover:bg-[#F1F6FE] hover:text-[#061E45]'
                  }`}
                  style={isActive ? { color: '#FFFFFF' } : undefined}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cards Grid */}
        {error ? (
          <div className="mx-auto max-w-2xl">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto max-w-xl py-12">
            <EmptyState
              title="No matching loan products"
              description="No active loan products match your search query or selected category filter. Try clearing your search or selecting 'All Products'."
            />
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#DCE5F1] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#F5B927] hover:shadow-xl"
              >
                <div className="space-y-5 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center justify-center rounded-xl border border-[#DCE5F1] bg-[#EAF2FD] px-3.5 py-1.5 text-xs font-extrabold text-[#0B2F5B]">
                      {product.code}
                    </span>
                    <span className="inline-flex items-center rounded-lg border border-[#F5B927]/40 bg-[#FFF9E6] px-2.5 py-1 text-[11px] font-bold text-[#8A6100]">
                      {getProductCategory(product)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-extrabold text-[#061E45] transition-colors group-hover:text-[#0052B4]">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#475467]">
                      {product.description ||
                        'Flexible credit solution designed to support your financial objectives.'}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE]/70 p-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#667085]">
                        Amount Range
                      </span>
                      <span className="font-mono font-bold text-[#061E45]">
                        {formatNaira(product.min_amount)} -{' '}
                        {formatNaira(product.max_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#667085]">
                        Repayment Term
                      </span>
                      <span className="font-bold text-[#061E45]">
                        {product.min_term_months} - {product.max_term_months}{' '}
                        months
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#667085]">
                        Interest Rate
                      </span>
                      <span className="font-bold text-[#0052B4]">
                        {product.annual_interest_pct}% / yr (
                        {product.interest_method})
                      </span>
                    </div>
                  </div>

                  {product.eligibility_notes && (
                    <div className="space-y-0.5 rounded-xl border border-[#DCE5F1] bg-[#F8FAFD] p-3.5 text-xs text-[#344054]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                        Eligibility Note
                      </p>
                      <p className="line-clamp-2 text-[11px] leading-relaxed">
                        {product.eligibility_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#DCE5F1] bg-[#F8FAFD] p-6">
                  <Link
                    to={`/apply?product=${product.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD036] px-4 py-3.5 text-xs font-extrabold !text-[#061E45] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066]"
                    style={{ color: '#061E45' }}
                  >
                    <span>View Details &amp; Apply</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}