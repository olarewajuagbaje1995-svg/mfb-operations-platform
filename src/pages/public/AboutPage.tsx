import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { brand } from '@/config/brand'
import { supabase } from '@/lib/supabase'
import { TrustIndicator, TRUST_INDICATORS } from '@/components/ui/TrustIndicator'

interface ExtraSection {
  title: string
  body: string
}

interface AboutContent {
  hero_badge: string
  hero_title_line1: string
  hero_title_line2: string
  hero_subtitle: string
  intro_eyebrow: string
  intro_title: string
  intro_description: string
  positioning_title: string
  positioning_body: string
  offerings: string[]
  extra_sections: ExtraSection[]
  leadership_title: string
  leadership_subtitle: string
  leadership_body: string
  cta_title: string
  cta_subtitle: string
}

const DEFAULT_ABOUT: AboutContent = {
  hero_badge: `About ${brand.name}`,
  hero_title_line1: 'Built to Finance',
  hero_title_line2: 'Nigerian Business.',
  hero_subtitle:
    'CLOBANS FINANCE provides accessible, responsible and transparent financing solutions for Nigerian businesses, entrepreneurs and growing enterprises.',
  intro_eyebrow: 'WHO WE ARE',
  intro_title: 'Accessible, Responsible Financing for Growing Enterprises',
  intro_description:
    'We are a purpose-driven financing institution focused on helping small and medium enterprises acquire productive assets, manage cash flow and scale sustainably.',
  positioning_title: 'Our Positioning',
  positioning_body:
    'We position ourselves as an accessible, responsible and transparent source of financing for Nigerian SMEs — businesses that drive employment and economic growth across Kuje, Abuja and beyond.',
  offerings: [
    'SME Business Loans',
    'Asset-Backed Finance',
    'Equipment Finance',
    'Working Capital Finance',
  ],
  extra_sections: [],
  leadership_title: 'Meet Our Management Team',
  leadership_subtitle: 'Responsible financing starts with responsible leadership.',
  leadership_body:
    'Our Board of Directors, executive management and departmental leaders steer our commitment to transparency, accountability and customer protection.',
  cta_title: 'Ready to Grow Your Business?',
  cta_subtitle:
    'Discover financing solutions designed to support your next stage of growth.',
}

const ABOUT_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80',
    alt: 'Business leadership team collaborating on SME financing strategy',
  },
  {
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1400&q=80',
    alt: 'Modern enterprise advisors reviewing business growth plans',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80',
    alt: 'Dedicated financial support team guiding growing businesses',
  },
]

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ABOUT_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadAboutContent() {
      const { data, error } = await supabase
        .from('about_page_content')
        .select('*')
        .eq('slug', 'about-us')
        .maybeSingle()

      if (!error && data) {
        setContent({
          hero_badge: data.hero_badge || DEFAULT_ABOUT.hero_badge,
          hero_title_line1: data.hero_title_line1 || DEFAULT_ABOUT.hero_title_line1,
          hero_title_line2: data.hero_title_line2 || DEFAULT_ABOUT.hero_title_line2,
          hero_subtitle: data.hero_subtitle || DEFAULT_ABOUT.hero_subtitle,
          intro_eyebrow: data.intro_eyebrow || DEFAULT_ABOUT.intro_eyebrow,
          intro_title: data.intro_title || DEFAULT_ABOUT.intro_title,
          intro_description: data.intro_description || DEFAULT_ABOUT.intro_description,
          positioning_title: data.positioning_title || DEFAULT_ABOUT.positioning_title,
          positioning_body: data.positioning_body || DEFAULT_ABOUT.positioning_body,
          offerings: Array.isArray(data.offerings) && data.offerings.length > 0
            ? data.offerings
            : DEFAULT_ABOUT.offerings,
          extra_sections: Array.isArray(data.extra_sections)
            ? (data.extra_sections as ExtraSection[])
            : [],
          leadership_title: data.leadership_title || DEFAULT_ABOUT.leadership_title,
          leadership_subtitle:
            data.leadership_subtitle || DEFAULT_ABOUT.leadership_subtitle,
          leadership_body: data.leadership_body || DEFAULT_ABOUT.leadership_body,
          cta_title: data.cta_title || DEFAULT_ABOUT.cta_title,
          cta_subtitle: data.cta_subtitle || DEFAULT_ABOUT.cta_subtitle,
        })
      }
    }

    loadAboutContent()
  }, [])

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-[#101828]">
      <SEO
        title="About Us | CLOBANS FINANCE"
        description="Learn about CLOBANS FINANCE — SME financing, asset-backed lending and business growth partners for Nigerian businesses."
      />

      {/* 1. HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {ABOUT_HERO_SLIDES.map((slide, index) => (
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  {content.hero_badge}
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.12] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                {content.hero_title_line1}
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  {content.hero_title_line2}
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                {content.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Apply for Financing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/management"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <Users className="h-4 w-4" />
                  <span>Meet Our Leadership</span>
                </Link>
              </div>
            </div>

            <div className="relative h-60 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {ABOUT_HERO_SLIDES.map((slide, index) => (
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
            {ABOUT_HERO_SLIDES.map((_, index) => (
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

      {/* 2. POSITIONING, OFFERINGS & ADMIN EXTRA SECTIONS */}
      <section className="bg-[#F1F6FE] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B2F5B]">
                {content.intro_eyebrow}
              </span>
              <span className="h-px w-10 bg-[#93B4E2] sm:w-14" />
            </div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-[#061E45] sm:text-3xl lg:text-4xl">
              {content.intro_title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475467]">
              {content.intro_description}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#DCE5F1] bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B]">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-[#061E45]">
                {content.positioning_title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">
                {content.positioning_body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Transparent Terms', 'Responsible Lending', 'SME Focused'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F6FE] px-3.5 py-1.5 text-xs font-bold text-[#0B2F5B]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#D69E13]" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCE5F1] bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-md">
              <h3 className="font-heading text-xl font-extrabold text-[#061E45]">
                What We Offer
              </h3>
              <p className="mt-2 text-sm text-[#475467]">
                Tailored credit facilities designed around real business needs:
              </p>
              <ul className="mt-5 space-y-3.5">
                {content.offerings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#F5B927]" />
                    <span className="text-sm font-bold text-[#061E45]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0052B4] hover:text-[#B8840A]"
              >
                <span>Explore All Products</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Dynamic Custom Sections Added by Admin */}
          {content.extra_sections.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {content.extra_sections.map((sec, idx) => (
                <div
                  key={`${sec.title}-${idx}`}
                  className="rounded-2xl border border-[#DCE5F1] bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#F5B927] hover:shadow-md"
                >
                  <h3 className="font-heading text-xl font-extrabold text-[#061E45]">
                    {sec.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#475467]">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. TRUST INDICATORS */}
      <section className="border-y border-[#DCE5F1] bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
              {brand.name}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#061E45] sm:text-3xl">
              Why Businesses Trust Us
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_INDICATORS.map((item) => (
              <TrustIndicator key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. LEADERSHIP PREVIEW */}
      <section className="bg-[#F1F6FE] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
                LEADERSHIP &amp; GOVERNANCE
              </p>
              <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#061E45] sm:text-4xl">
                {content.leadership_title}
              </h2>
              <p className="mt-3 text-base font-medium text-[#0B2F5B]">
                {content.leadership_subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#475467]">
                {content.leadership_body}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-7 shadow-xl">
                <p
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Leadership Page
                </p>
                <h3
                  className="mt-2 font-heading text-2xl font-extrabold !text-white"
                  style={{ color: '#FFFFFF' }}
                >
                  Management &amp; Leadership
                </h3>
                <p
                  className="mt-3 text-sm leading-6 !text-white/90"
                  style={{ color: '#EAF2FD' }}
                >
                  See the people behind our commitment to responsible SME
                  financing and institutional accountability.
                </p>
                <Link
                  to="/management"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-5 py-3 text-sm font-extrabold !text-[#061E45] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066]"
                  style={{ color: '#061E45' }}
                >
                  <span>View Leadership Team</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-10 text-center shadow-2xl sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="relative z-10">
              <h2
                className="font-heading text-3xl font-extrabold !text-white sm:text-4xl"
                style={{ color: '#FFFFFF' }}
              >
                {content.cta_title}
              </h2>
              <p
                className="mx-auto mt-4 max-w-xl text-base leading-7 !text-white/95"
                style={{ color: '#EAF2FD' }}
              >
                {content.cta_subtitle}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-7 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Apply for Financing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-7 py-3.5 text-sm font-bold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD036] hover:bg-white/20 sm:text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  <span>Contact Our Team</span>
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