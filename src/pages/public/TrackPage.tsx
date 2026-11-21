import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  FileText,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { trackApplication } from '@/services/publicApi'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Field'
import { Alert } from '@/components/feedback'
import { StatusBadge } from '@/components/StatusBadge'
import { SEO } from '@/components/seo/SEO'
import { usePageSeo } from '@/hooks/usePageSeo'
import { formatDate, formatNaira } from '@/utils/format'
import type { ApplicationStatus } from '@/types/status'

const TRACK_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    alt: 'Real-time application tracking and financial review dashboard',
  },
  {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    alt: 'Credit officer reviewing SME financing application status',
  },
  {
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Business owner checking financing status online',
  },
]

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const [reference, setReference] = useState(searchParams.get('ref') || '')
  const [trackingCode, setTrackingCode] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appData, setAppData] = useState<any>(null)

  usePageSeo({
    title: 'Track Application Status | CLOBANS FINANCE',
    description:
      'Track your CLOBANS FINANCE loan application with your reference and tracking code.',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TRACK_HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  async function handleTrack(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    if (!reference.trim() || !trackingCode.trim()) {
      setError(
        'Please provide both your application reference and tracking code.'
      )
      return
    }

    try {
      setLoading(true)
      const data = await trackApplication(
        reference.trim().toUpperCase(),
        trackingCode.trim().toUpperCase()
      )
      setAppData(data)
    } catch (err: any) {
      setError(err.message || 'Tracking failed. Check your reference and code.')
    } finally {
      setLoading(false)
    }
  }

  const documents = appData?.application_documents || []

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F1F6FE] pb-24 font-sans text-[#101828]">
      <SEO
        title="Track Application | CLOBANS FINANCE"
        description="Track your CLOBANS FINANCE loan application status in real time using your reference number and secure tracking code."
      />

      {/* =========================================
          1. BRIGHT DYNAMIC HERO WITH SLIDER
      ========================================= */}
      <section className="relative isolate overflow-hidden bg-[#072452]">
        {/* Right-side sliding stock photos (Desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[56%]">
          {TRACK_HERO_SLIDES.map((slide, index) => (
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
                  CLOBANS FINANCE Live Portal
                </span>
              </div>

              <h1
                className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight !text-white sm:text-5xl lg:text-[52px]"
                style={{ color: '#FFFFFF' }}
              >
                Track Your
                <span
                  className="mt-1 block !text-[#FFD036]"
                  style={{ color: '#FFD036' }}
                >
                  Application Status.
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed !text-white/95 sm:text-lg"
                style={{ color: '#F5F9FF' }}
              >
                Enter your unique application reference and secure tracking code
                to check your credit review progress and view verified document
                extraction results.
              </p>
            </div>

            {/* Mobile-only sliding image */}
            <div className="relative h-56 overflow-hidden rounded-2xl border border-white/20 shadow-xl lg:hidden">
              {TRACK_HERO_SLIDES.map((slide, index) => (
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
            {TRACK_HERO_SLIDES.map((_, index) => (
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
          2. TRACKING FORM & RESULTS
      ========================================= */}
      <div className="mx-auto mt-12 max-w-4xl space-y-8 px-4 sm:px-6">
        {/* TRACKING INPUT FORM CARD */}
        <form
          onSubmit={handleTrack}
          className="space-y-6 rounded-3xl border border-[#DCE5F1] bg-white p-7 shadow-sm transition-all sm:p-10"
        >
          <div className="flex items-start gap-3.5 border-b border-[#DCE5F1] pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B]">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                Lookup Your Application
              </h2>
              <p className="mt-1 text-xs text-[#475467] sm:text-sm">
                Both fields are required to protect your application details.
              </p>
            </div>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="Application Reference"
              required
              placeholder="e.g. MFB-ABC12"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <TextField
              label="Secure Tracking Code"
              required
              placeholder="e.g. A1B2C3D4E5"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
            <p className="flex items-center gap-2 text-xs text-[#667085]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B2F5B]" />
              <span>Your application data is encrypted and private.</span>
            </p>

            <Button
              type="submit"
              loading={loading}
              className="w-full rounded-xl bg-[#FFD036] px-8 py-3.5 text-sm font-extrabold !text-[#061E45] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066] sm:w-auto"
              style={{ color: '#061E45' }}
            >
              Check Status →
            </Button>
          </div>
        </form>

        {/* APPLICATION STATUS & DETAILS RESULT CARD */}
        {appData && (
          <div className="space-y-8 rounded-3xl border border-[#DCE5F1] bg-white p-7 shadow-md sm:p-10">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-[#DCE5F1] pb-6 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center rounded-full border border-[#DCE5F1] bg-[#EAF2FD] px-3.5 py-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#0B2F5B]">
                  REF: {appData.reference}
                </span>
                <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#061E45]">
                  Application Overview
                </h2>
              </div>
              <StatusBadge status={appData.status as ApplicationStatus} />
            </div>

            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-[#DCE5F1] bg-[#F1F6FE]/70 p-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B2F5B] shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Submitted On
                  </span>
                  <p className="mt-0.5 text-sm font-extrabold text-[#061E45]">
                    {formatDate(appData.submitted_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D69E13] shadow-sm">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Requested Amount
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-extrabold text-[#0052B4]">
                    {formatNaira(Number(appData.requested_amount))}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Inspection & OCR Extraction Results Display */}
            <div className="space-y-4 border-t border-[#DCE5F1] pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FD] text-[#0B2F5B]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#061E45]">
                    Submitted Documents &amp; OCR Verification
                  </h3>
                  <p className="text-xs text-[#475467]">
                    Review the verification documents attached to your
                    application and their extracted OCR contents.
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#DCE5F1] bg-[#F8FAFD] py-6 text-center text-xs italic text-[#667085]">
                  No documents were attached to this application.
                </p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="space-y-3 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold capitalize text-[#061E45]">
                          {doc.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                            doc.review_status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.review_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.review_status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-between gap-2 text-xs text-[#667085]">
                        <span>
                          File:{' '}
                          <strong className="text-[#344054]">
                            {doc.original_filename}
                          </strong>
                        </span>
                        <span>Uploaded: {formatDate(doc.created_at)}</span>
                      </div>

                      <div className="space-y-1.5 border-t border-[#DCE5F1] pt-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
                          OCR Text Extraction Results
                        </span>
                        <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#DCE5F1] bg-white p-4 font-sans text-xs leading-relaxed text-[#344054]">
                          {doc.ocr_extracted_text ||
                            'No text extracted from this document.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HELP CTA */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-extrabold text-[#061E45]">
              Need help with your application?
            </p>
            <p className="text-xs text-[#475467]">
              Can&apos;t find your reference number or have a question about
              your review?
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#0B2F5B] bg-white px-5 py-2.5 text-xs font-bold text-[#0B2F5B] transition-all hover:bg-[#0B2F5B] hover:text-white"
          >
            <span>Contact Support</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  )
}