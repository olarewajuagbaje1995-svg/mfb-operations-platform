import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, HelpCircle, Mail, Phone, Search, X } from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { brand } from '@/config/brand'
import { supabase } from '@/lib/supabase'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { Spinner } from '@/components/feedback'

interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
}

const FAQ_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Business advisor answering SME financing questions',
  },
  {
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80',
    alt: 'Reviewing loan eligibility and documentation guidelines',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80',
    alt: 'CLOBANS FINANCE customer support team',
  },
]

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: 'fallback-1',
    category: 'General Questions',
    question: 'What is CLOBANS FINANCE?',
    answer:
      'CLOBANS FINANCE is an SME financing institution providing accessible, responsible and transparent financing solutions for Nigerian businesses and entrepreneurs.',
    display_order: 1,
  },
  {
    id: 'fallback-2',
    category: 'Application Process',
    question: 'How do I apply?',
    answer:
      'Apply online at /apply with your personal, business and financing details, then upload your supporting documents.',
    display_order: 2,
  },
]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FAQ_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadFaqs() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('faq_items')
          .select('id, category, question, answer, display_order')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (!error && data && data.length > 0) {
          setFaqs(data as FaqItem[])
        } else {
          setFaqs(FALLBACK_FAQS)
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err)
        setFaqs(FALLBACK_FAQS)
      } finally {
        setLoading(false)
      }
    }

    loadFaqs()
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqs.map((f) => f.category)))
    return ['All', ...unique]
  }, [faqs])

  const groupedFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = faqs.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory
      if (!matchesCat) return false
      if (!q) return true
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    })

    const map = new Map<string, FaqItem[]>()
    for (const item of filtered) {
      const list = map.get(item.category) || []
      list.push(item)
      map.set(item.category, list)
    }
    return Array.from(map.entries())
  }, [faqs, searchQuery, selectedCategory])

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F1F6FE] pb-24 font-sans text-[#101828]">
      <SEO
        title="FAQ | CLOBANS FINANCE"
        description="Frequently asked questions about CLOBANS FINANCE financing products, applications and support."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {FAQ_HERO_SLIDES.map((slide, index) => (
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Help Centre
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[52px]"
                style={{ color: '#FFFFFF' }}
              >
                Frequently Asked
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Questions.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Everything you need to know about SME financing, eligibility,
                documentation, and tracking your application with CLOBANS
                FINANCE.
              </p>
            </div>

            <div className="relative h-56 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {FAQ_HERO_SLIDES.map((slide, index) => (
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
            {FAQ_HERO_SLIDES.map((_, index) => (
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
          2. SEARCH, CATEGORY FILTERS & ACCORDIONS
      ========================================= */}
      <div className="mx-auto mt-12 max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-5 rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#DCE5F1] pb-5 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
                {brand.name}
              </span>
              <h2 className="mt-1 font-heading text-2xl font-extrabold text-[#061E45]">
                Have Questions? We Have Answers
              </h2>
            </div>

            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Search questions or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] py-3 pl-11 pr-10 text-xs font-medium text-[#101828] focus:border-[#0052B4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052B4]/20"
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

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0B2F5B] !text-white shadow-sm ring-2 ring-[#FFD036]'
                      : 'border border-[#DCE5F1] bg-white text-[#475467] hover:border-[#F5B927] hover:bg-[#F1F6FE] hover:text-[#061E45]'
                  }`}
                  style={isActive ? { color: '#FFFFFF' } : undefined}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[25vh] items-center justify-center rounded-3xl border border-[#DCE5F1] bg-white">
            <Spinner label="Loading frequently asked questions..." />
          </div>
        ) : groupedFaqs.length === 0 ? (
          <div className="rounded-3xl border border-[#DCE5F1] bg-white p-12 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-[#93B4E2]" />
            <p className="mt-3 text-base font-extrabold text-[#061E45]">
              No matching questions found
            </p>
            <p className="mt-1 text-xs text-[#475467]">
              Try clearing your search or selecting &ldquo;All&rdquo; categories.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedFaqs.map(([categoryTitle, items]) => (
              <section
                key={categoryTitle}
                className="rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-6 w-1.5 rounded-full bg-[#FFD036]" />
                  <h3 className="font-heading text-xl font-extrabold text-[#061E45]">
                    {categoryTitle}
                  </h3>
                </div>
                <FAQAccordion
                  items={items.map((i) => ({
                    question: i.question,
                    answer: i.answer,
                  }))}
                />
              </section>
            ))}
          </div>
        )}

        {/* STILL NEED HELP CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-8 text-center shadow-xl sm:p-12">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2
              className="font-heading text-2xl font-extrabold !text-white sm:text-3xl"
              style={{ color: '#FFFFFF' }}
            >
              Still Have Questions?
            </h2>
            <p
              className="mt-3 text-sm leading-6 !text-white/90"
              style={{ color: '#EAF2FD' }}
            >
              Our support team is ready to help with your financing enquiry.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-white">
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 !text-white hover:border-[#FFD036]"
                style={{ color: '#FFFFFF' }}
              >
                <Mail className="h-4 w-4 text-[#FFD036]" />
                <span>{brand.email}</span>
              </a>
              <a
                href={`tel:${brand.phone?.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 !text-white hover:border-[#FFD036]"
                style={{ color: '#FFFFFF' }}
              >
                <Phone className="h-4 w-4 text-[#FFD036]" />
                <span>{brand.phone}</span>
              </a>
            </div>

            <div className="mt-7">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3 text-sm font-extrabold !text-[#061E45] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#FFE066]"
                style={{ color: '#061E45' }}
              >
                <span>Contact Our Team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}