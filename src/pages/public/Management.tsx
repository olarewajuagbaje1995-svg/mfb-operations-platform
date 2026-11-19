import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  Link as LucideLink,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { SEO } from '@/components/seo/SEO'
import { brand } from '@/config/brand'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/feedback'
import {
  publishedManagement,
  type ManagementPerson,
} from '@/data/management'

const MANAGEMENT_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80',
    alt: 'Executive leadership team collaborating on corporate governance',
  },
  {
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1400&q=80',
    alt: 'Board and management team driving responsible SME financing',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80',
    alt: 'Departmental leaders supporting Nigerian business growth',
  },
]

const LEADERSHIP_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Integrity',
    text: 'Upholding transparency and responsible practices.',
  },
  {
    icon: Users,
    title: 'Accountability',
    text: 'Promoting responsible leadership and governance.',
  },
  {
    icon: Target,
    title: 'Purpose',
    text: 'Supporting business development and growth.',
  },
  {
    icon: Handshake,
    title: 'Commitment',
    text: 'Building lasting relationships with customers.',
  },
]

interface DynamicManagementPerson extends ManagementPerson {
  isCeo?: boolean
}

function ProfileImage({ person }: { person: DynamicManagementPerson }) {
  const [failed, setFailed] = useState(false)

  const initials = person.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (!person.image || failed) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-[#EAF2FD] to-[#DCE5F1] font-heading text-4xl font-extrabold text-[#0B2F5B]">
        {initials || 'CF'}
      </div>
    )
  }

  return (
    <img
      src={person.image}
      alt={`Portrait of ${person.name}`}
      className="aspect-[4/3] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function ProfileCard({ person }: { person: DynamicManagementPerson }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[#DCE5F1] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#F5B927] hover:shadow-xl">
      <div className="overflow-hidden">
        <ProfileImage person={person} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex w-fit rounded-full bg-[#FFF9E6] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#8A6100]">
          {person.department || person.category}
        </span>

        <h3 className="mt-3 font-heading text-xl font-extrabold text-[#061E45]">
          {person.name}
        </h3>

        <p className="mt-1 text-sm font-semibold text-[#0052B4]">
          {person.position}
        </p>

        <p className="mt-4 text-sm leading-6 text-[#475467]">
          {person.shortBio}
        </p>

        {person.fullBio && (
          <details className="mt-4">
            <summary className="cursor-pointer list-none text-xs font-extrabold uppercase tracking-wider text-[#0B2F5B] hover:text-[#B8840A]">
              Read full profile →
            </summary>
            <p className="mt-3 text-sm leading-6 text-[#475467]">
              {person.fullBio}
            </p>
            {person.qualifications?.length ? (
              <ul className="mt-3 space-y-1.5 text-xs text-[#475467]">
                {person.qualifications.map((qualification) => (
                  <li key={qualification} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F5B927]" />
                    <span>{qualification}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </details>
        )}

        {person.linkedin && (
          <div className="mt-auto pt-5">
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${person.name} on LinkedIn`}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0B2F5B] transition-colors hover:text-[#B8840A]"
            >
              <LucideLink className="h-4 w-4" />
              <span>LinkedIn Profile</span>
            </a>
          </div>
        )}
      </div>
    </article>
  )
}

function LeadershipSection({
  title,
  description,
  people,
  tinted = false,
}: {
  title: string
  description: string
  people: DynamicManagementPerson[]
  tinted?: boolean
}) {
  if (!people.length) return null

  return (
    <section className={tinted ? 'bg-[#F1F6FE] py-16 sm:py-20' : 'bg-white py-16 sm:py-20'}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B8840A]">
            {brand.name}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#061E45] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#475467]">
            {description}
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <ProfileCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Management() {
  const [people, setPeople] = useState<DynamicManagementPerson[]>(publishedManagement)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MANAGEMENT_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchManagement() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('management_team')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (!error && data && data.length > 0) {
          const mapped: DynamicManagementPerson[] = data.map((row: any) => ({
            id: row.id,
            displayOrder: row.display_order,
            name: row.name,
            position: row.position,
            category: row.category,
            department: row.department || undefined,
            isCeo: Boolean(row.is_ceo),
            shortBio: row.short_bio || '',
            fullBio: row.full_bio || undefined,
            qualifications: Array.isArray(row.qualifications)
              ? row.qualifications
              : [],
            image: row.image_url || undefined,
            linkedin: row.linkedin_url || undefined,
            published: Boolean(row.is_published),
          }))
          setPeople(mapped)
        }
      } catch (err) {
        console.error('Failed to load management team from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchManagement()
  }, [])

  const ceo = people.find(
    (person) =>
      person.isCeo ||
      (person.category === 'executive' &&
        person.position.toLowerCase().includes('chief executive officer'))
  )
  const board = people.filter(
    (person) => person.category === 'board' && person.id !== ceo?.id
  )
  const executives = people.filter(
    (person) => person.category === 'executive' && person.id !== ceo?.id
  )
  const departments = people.filter(
    (person) => person.category === 'departmental' && person.id !== ceo?.id
  )

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-[#101828]">
      <SEO
        title="Management & Leadership | CLOBANS FINANCE"
        description="Meet the leadership and management team of CLOBANS FINANCE and learn about the people driving responsible SME financing and business growth."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {MANAGEMENT_HERO_SLIDES.map((slide, index) => (
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
                  Leadership &amp; Governance
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[54px]"
                style={{ color: '#FFFFFF' }}
              >
                The People Behind Our
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Commitment.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Meet the leadership team driving our commitment to responsible
                financing, transparency, customer service and sustainable
                business growth.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                  style={{ color: '#061E45' }}
                >
                  <span>Discover Our Institution</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-60 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {MANAGEMENT_HERO_SLIDES.map((slide, index) => (
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
            {MANAGEMENT_HERO_SLIDES.map((_, index) => (
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
          2. LEADERSHIP VALUES STRIP
      ========================================= */}
      <section className="border-b border-[#DCE5F1] bg-[#F1F6FE]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
          {LEADERSHIP_VALUES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2F5B] text-[#FFD036]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-[#061E45]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#475467]">
                    {item.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* LOADING STATE */}
      {loading && people.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner label="Loading leadership profiles..." />
        </div>
      ) : (
        <>
          {/* =========================================
              3. CEO SPOTLIGHT
          ========================================= */}
          {ceo && (
            <section className="bg-white py-16 sm:py-20">
              <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 sm:px-8">
                <div className="overflow-hidden rounded-3xl border border-[#DCE5F1] bg-[#EAF2FD] shadow-lg">
                  <ProfileImage person={ceo} />
                </div>

                <div>
                  <span className="inline-flex rounded-full bg-[#FFF9E6] px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A6100]">
                    Executive Leadership
                  </span>
                  <h2 className="mt-4 font-heading text-3xl font-extrabold text-[#061E45] sm:text-4xl">
                    {ceo.name}
                  </h2>
                  <p className="mt-1.5 text-lg font-bold text-[#0052B4]">
                    {ceo.position}
                  </p>
                  <p className="mt-5 text-base leading-8 text-[#475467]">
                    {ceo.fullBio || ceo.shortBio}
                  </p>

                  {ceo.qualifications?.length ? (
                    <ul className="mt-5 space-y-2 text-sm text-[#475467]">
                      {ceo.qualifications.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#F5B927]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {ceo.linkedin && (
                    <a
                      href={ceo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#0B2F5B] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0B2F5B] transition-all hover:bg-[#0B2F5B] hover:text-white"
                    >
                      <LucideLink className="h-4 w-4" />
                      <span>Connect on LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* =========================================
              4. BOARD, EXECUTIVES & DEPARTMENTAL
          ========================================= */}
          <LeadershipSection
            title="Board of Directors"
            description="The board provides institutional oversight and strategic direction."
            people={board}
            tinted
          />

          <LeadershipSection
            title="Executive Management"
            description="Our executive leadership oversees the institution's strategy, operations and performance."
            people={executives}
          />

          <LeadershipSection
            title="Departmental Leadership"
            description="Meet the professionals supporting our daily operations and customer services."
            people={departments}
            tinted
          />
        </>
      )}

      {/* =========================================
          5. LEADERSHIP COMMITMENT CTA
      ========================================= */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072452] via-[#0D3B7A] to-[#0052B4] p-10 text-center shadow-2xl sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <p
                className="text-xs font-extrabold uppercase tracking-[0.2em] !text-[#FFD036]"
                style={{ color: '#FFD036' }}
              >
                Our Leadership Commitment
              </p>
              <h2
                className="mt-4 font-heading text-3xl font-extrabold !text-white sm:text-4xl"
                style={{ color: '#FFFFFF' }}
              >
                Leadership Built on Trust, Responsibility and Growth.
              </h2>
              <p
                className="mt-5 text-base leading-8 !text-white/90"
                style={{ color: '#EAF2FD' }}
              >
                At {brand.name}, we believe responsible leadership, transparency
                and customer-focused financing are essential to sustainable
                business growth.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-7 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:text-base"
                style={{ color: '#061E45' }}
              >
                <span>Contact Our Team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}