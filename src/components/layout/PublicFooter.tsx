import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import BrandLogo from '@/components/brand/BrandLogo'
import { brand } from '@/config/brand'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Management & Leadership', to: '/management' },
  { label: 'FAQs (Q&A)', to: '/faq' },
  { label: 'Our Products', to: '/products' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Eligibility', to: '/eligibility' },
  { label: 'Track Application', to: '/track' },
  { label: 'Contact Us', to: '/contact' },
]

const PRODUCT_LINKS = (brand.products || []).map((p) => ({
  label: p.name,
  to: `/products/${p.id}`,
}))

// Responsibility: high-contrast navy public footer with brand contact details and site links.
export function PublicFooter() {
  const socials = Object.entries(brand.social || {}).filter(([, url]) =>
    Boolean(url)
  )

  return (
    <footer className="border-t-4 border-[#FFD036] bg-gradient-to-b from-[#072452] to-[#061E45] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Logo & Description */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <BrandLogo variant="white" height={38} />
            </Link>

            <p
              className="mt-5 max-w-sm text-sm leading-7 !text-white/85"
              style={{ color: '#EAF2FD' }}
            >
              CLOBANS FINANCE provides accessible, responsible and transparent
              financing solutions that help Nigerian businesses grow, acquire
              productive assets and build sustainable enterprises.
            </p>

            <div className="mt-6">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-5 py-2.5 text-xs font-extrabold !text-[#061E45] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE066]"
                style={{ color: '#061E45' }}
              >
                <span>Apply for Financing</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {socials.map(([network, url]) => (
                  <a
                    key={network}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${network} profile`}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold !text-white transition-colors hover:border-[#FFD036] hover:bg-white/15"
                    style={{ color: '#FFFFFF' }}
                  >
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3
              className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
              style={{ color: '#FFD036' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium !text-white/85 transition-colors hover:!text-[#FFD036]"
                    style={{ color: '#EAF2FD' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Financing Products */}
          <div className="lg:col-span-3">
            <h3
              className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
              style={{ color: '#FFD036' }}
            >
              Financing Products
            </h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((product) => (
                <li key={product.label}>
                  <Link
                    to={product.to}
                    className="text-sm font-medium !text-white/85 transition-colors hover:!text-[#FFD036]"
                    style={{ color: '#EAF2FD' }}
                  >
                    {product.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3
              className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] !text-[#FFD036]"
              style={{ color: '#FFD036' }}
            >
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD036]" />
                <a
                  href={`tel:${brand.phone?.replace(/\s+/g, '')}`}
                  className="font-medium !text-white/90 transition-colors hover:!text-[#FFD036]"
                  style={{ color: '#EAF2FD' }}
                >
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD036]" />
                <a
                  href={`mailto:${brand.email}`}
                  className="break-all font-medium !text-white/90 transition-colors hover:!text-[#FFD036]"
                  style={{ color: '#EAF2FD' }}
                >
                  {brand.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD036]" />
                <span
                  className="leading-6 !text-white/90"
                  style={{ color: '#EAF2FD' }}
                >
                  {brand.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-xs md:flex-row">
          <p className="!text-white/75" style={{ color: '#CBD5E1' }}>
            © {new Date().getFullYear()} CLOBANS FINANCE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/contact"
              className="font-medium !text-white/80 transition-colors hover:!text-[#FFD036]"
              style={{ color: '#EAF2FD' }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="font-medium !text-white/80 transition-colors hover:!text-[#FFD036]"
              style={{ color: '#EAF2FD' }}
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter