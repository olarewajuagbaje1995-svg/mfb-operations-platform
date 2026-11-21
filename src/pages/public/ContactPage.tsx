import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { usePageSeo } from '@/hooks/usePageSeo'
import { brand } from '@/config/brand'
import { ContactForm } from '@/components/ui/ContactForm'

const CONTACT_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
    alt: 'CLOBANS FINANCE customer support team assisting business clients',
  },
  {
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Dedicated advisor guiding a business owner through financing options',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80',
    alt: 'Professional financial support team ready to help Nigerian SMEs',
  },
]

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const opened = searchParams.get('opened') === 'true'
  const [currentSlide, setCurrentSlide] = useState(0)

  usePageSeo({
    title: 'Contact CLOBANS FINANCE',
    description:
      'Get in touch with CLOBANS FINANCE — phone, email, or visit our office in Kuje, Abuja.',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CONTACT_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const contactItems = [
    {
      icon: MapPin,
      label: 'Head Office',
      text: brand.address,
      href: undefined,
    },
    {
      icon: Phone,
      label: 'Phone',
      text: brand.phone,
      href: brand.phone ? `tel:${brand.phone.replace(/\s+/g, '')}` : undefined,
    },
    {
      icon: Mail,
      label: 'Email',
      text: brand.email,
      href: brand.email ? `mailto:${brand.email}` : undefined,
    },
  ]

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F1F6FE] pb-24 font-sans text-[#101828]">
      <SEO
        title="Contact Us | CLOBANS FINANCE"
        description="Get in touch with CLOBANS FINANCE — phone, email, office address in Kuje, Abuja, and contact enquiry form."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {CONTACT_HERO_SLIDES.map((slide, index) => (
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD036]/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Contact {brand.name}
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[52px]"
                style={{ color: '#FFFFFF' }}
              >
                Get in Touch
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  With Our Team.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Have a question about our SME financing solutions or need help
                with your application? Our advisors are ready to assist you.
              </p>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-56 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {CONTACT_HERO_SLIDES.map((slide, index) => (
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
            {CONTACT_HERO_SLIDES.map((_, index) => (
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
          2. CONTACT DETAILS & ENQUIRY FORM
      ========================================= */}
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        {opened && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <p className="text-sm font-semibold text-emerald-900">
                Your message has been sent. You can track your enquiry anytime
                using our tracking portal.
              </p>
            </div>
            <Link
              to="/track"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0B2F5B] px-5 py-2.5 text-xs font-bold !text-white transition-all hover:bg-[#0052B4]"
              style={{ color: '#FFFFFF' }}
            >
              <span>Track Application</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: CONTACT INFO CARDS */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-[#DCE5F1] bg-white p-7 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
                {brand.name}
              </span>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#061E45]">
                Visit or Contact Us
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#475467]">
                Reach our team directly via phone, email, or visit our head
                office during business hours.
              </p>

              <div className="mt-6 space-y-5">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-4 transition-colors hover:border-[#F5B927]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#667085]">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="mt-0.5 block break-words text-sm font-bold text-[#061E45] transition-colors hover:text-[#0052B4]"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <p className="mt-0.5 break-words text-sm font-bold text-[#061E45]">
                            {item.text}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE]/70 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2F5B]" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#061E45]">
                    Business Hours
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#475467]">
                    Monday – Friday, 9:00 AM to 5:00 PM (West Africa Time).
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK TRUST NOTE */}
            <div className="rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-7 shadow-lg">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#FFD036]" />
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.16em] !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Dedicated Support
                </span>
              </div>
              <p
                className="mt-3 text-sm leading-6 !text-white/95"
                style={{ color: '#EAF2FD' }}
              >
                Already submitted a loan application? Track your review progress
                instantly in our live portal.
              </p>
              <Link
                to="/track"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-5 py-2.5 text-xs font-extrabold !text-[#061E45] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#FFE066]"
                style={{ color: '#061E45' }}
              >
                <span>Track Application</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT: CONTACT ENQUIRY FORM */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-[#DCE5F1] bg-white p-7 shadow-sm sm:p-10">
              <div className="mb-8 border-b border-[#DCE5F1] pb-6">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8840A]">
                  Send a Message
                </span>
                <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#061E45] sm:text-3xl">
                  Contact Enquiry
                </h2>
                <p className="mt-2 text-sm text-[#475467]">
                  Tell us how we can help and our team will respond as soon as
                  possible.
                </p>
              </div>

              <ContactForm orgSlug="demo-mfb" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}