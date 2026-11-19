import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'
import BrandLogo from '@/components/brand/BrandLogo'
import { brand } from '@/config/brand'

const ABOUT_SUB_ITEMS = [
  { label: 'About Us', to: '/about' },
  { label: 'Management & Leadership', to: '/management' },
  { label: 'FAQs (Q&A)', to: '/faq' },
]

// Responsibility: two-level public header — white top information bar + navy main navigation
// with a responsive mobile hamburger drawer. Contact details come from brand config.
export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(`${to}/`))

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top information bar — white */}
      <div className="border-b border-[#DCE5F1] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-sm md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex shrink-0 items-center gap-2 rounded-lg p-1 transition hover:bg-[#F1F6FE]"
              >
                <BrandLogo variant="primary" height={34} />
              </Link>
              {brand.industry && (
                <span className="hidden border-l border-[#DCE5F1] pl-3 text-[11px] font-bold uppercase tracking-wider text-[#475467] md:block">
                  {brand.industry}
                </span>
              )}
            </div>

            <div className="hidden items-center gap-6 whitespace-nowrap text-xs font-semibold text-[#344054] lg:flex">
              <a
                href={`tel:${brand.phone?.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 transition-colors hover:text-[#0052B4]"
                style={{ color: '#344054' }}
              >
                <Phone className="h-3.5 w-3.5 text-[#072452]" />
                <span>{brand.phone}</span>
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-1.5 transition-colors hover:text-[#0052B4]"
                style={{ color: '#344054' }}
              >
                <Mail className="h-3.5 w-3.5 text-[#072452]" />
                <span>{brand.email}</span>
              </a>
              <div className="flex items-center gap-1.5 text-[#344054]">
                <MapPin className="h-3.5 w-3.5 text-[#072452]" />
                <span>{brand.hq}</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-xl border border-[#DCE5F1] bg-[#F8FAFD] p-2 text-[#061E45] transition-colors hover:border-[#FFD036] hover:bg-[#EAF2FD] md:hidden"
              aria-label="Open navigation menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation — deep navy */}
      <nav
        className="hidden border-b border-white/10 bg-[#061E45] md:block"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-6 lg:gap-8">
              {brand.navigation.map((item) => {
                const isAbout =
                  item.label.toLowerCase().includes('about') || Boolean(item.items)

                if (isAbout) {
                  return (
                    <DesktopDropdown
                      key={item.label}
                      label={item.label}
                      items={ABOUT_SUB_ITEMS}
                    />
                  )
                }

                const active = isActive(item.to)
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`whitespace-nowrap py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                      active
                        ? 'border-b-2 border-[#FFD036]'
                        : 'border-b-2 border-transparent hover:border-[#FFD036]/60'
                    }`}
                    style={{ color: active ? '#FFD036' : '#FFFFFF' }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <Link
              to={brand.cta.to}
              className="shrink-0 whitespace-nowrap rounded-xl bg-[#FFD036] px-5 py-2 text-sm font-extrabold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066]"
              style={{ color: '#061E45' }}
            >
              {brand.cta.label}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-[#061E45]/80 backdrop-blur-sm" />
          <MobileNavigation onClose={() => setOpen(false)} />
        </div>
      )}
    </header>
  )
}

function DesktopDropdown({
  label,
  items,
}: {
  label: string
  items: { label: string; to: string }[]
}) {
  const location = useLocation()
  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(`${to}/`))

  const anyActive = items.some((sub) => isActive(sub.to))

  return (
    <div className="group relative py-2">
      <button
        type="button"
        className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
          anyActive
            ? 'border-b-2 border-[#FFD036]'
            : 'border-b-2 border-transparent hover:border-[#FFD036]/60'
        }`}
        style={{ color: anyActive ? '#FFD036' : '#FFFFFF' }}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      <div className="invisible absolute left-0 top-full z-30 w-64 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="rounded-2xl border border-[#DCE5F1] bg-white p-2 shadow-2xl">
          {items.map((sub) => {
            const subActive = isActive(sub.to)
            return (
              <Link
                key={sub.to}
                to={sub.to}
                className={`block rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  subActive ? 'bg-[#EAF2FD]' : 'hover:bg-[#F1F6FE]'
                }`}
                style={{ color: subActive ? '#0052B4' : '#061E45' }}
              >
                {sub.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Responsibility: mobile-only navigation drawer overlay.
export function MobileNavigation({ onClose }: { onClose: () => void }) {
  const location = useLocation()
  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(`${to}/`))

  return (
    <div className="flex h-full justify-end">
      <aside
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-[#DCE5F1] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#DCE5F1] px-6 py-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg p-1"
          >
            <BrandLogo variant="primary" height={32} />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-[#061E45] hover:bg-[#F1F6FE]"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
          {brand.navigation.map((item) => {
            const isAbout =
              item.label.toLowerCase().includes('about') || Boolean(item.items)

            if (isAbout) {
              return (
                <div
                  key={item.label}
                  className="rounded-2xl bg-[#F8FAFD] p-2.5"
                >
                  <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#B8840A]">
                    {item.label}
                  </p>
                  {ABOUT_SUB_ITEMS.map((sub) => {
                    const active = isActive(sub.to)
                    return (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        onClick={onClose}
                        className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                          active ? 'bg-[#FFD036]' : 'hover:bg-[#EAF2FD]'
                        }`}
                        style={{ color: '#061E45' }}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )
            }

            const active = isActive(item.to)
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  active ? 'bg-[#FFD036]' : 'hover:bg-[#F1F6FE]'
                }`}
                style={{ color: '#061E45' }}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="pt-4">
            <Link
              to={brand.cta.to}
              onClick={onClose}
              className="block rounded-xl bg-[#FFD036] px-4 py-3.5 text-center text-sm font-extrabold shadow-md hover:bg-[#FFE066]"
              style={{ color: '#061E45' }}
            >
              {brand.cta.label}
            </Link>
          </div>
        </nav>
      </aside>
    </div>
  )
}