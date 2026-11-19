import { useParams, Link } from 'react-router-dom'
import { SEO } from '@/components/seo/SEO'
import { ShieldCheck, Users, Target, FileText } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/ui/ProductCard'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { financingProducts, type ProductSlug } from '@/data/products'

// Responsibility: reusable product page template for each CLOBAN FINANCE financing product.
// Route: /products/:slug. Content is driven by src/data/products.ts.
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = financingProducts[slug as ProductSlug]

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-navy">Product not found</h2>
          <p className="mt-2 text-brand-text-secondary">
            The financing product you requested is not available.
          </p>
          <Link to="/products" className="mt-4 inline-block text-brand-gold font-bold hover:underline">
            View all products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <SEO
        title={`${product.name} | CLOBAN FINANCE`}
        description={`${product.tagline} ${product.description}`}
        image={product.heroImage}
      />

      {/* Product hero */}
      <section className="relative px-5 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556740734-95e9d662ca8d?auto=format&fit=crop&w=1600&q=80')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/90 via-brand-navy/80 to-brand-blue/90" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-sm border border-white/20">
            {product.name.toUpperCase()}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-brand-pale max-w-2xl leading-7">
            {product.tagline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-7 py-3 font-bold text-brand-deep shadow-sm hover:bg-brand-gold-light transition-colors"
            >
              Apply for Financing
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3 font-bold text-white hover:bg-white/10 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Introduction */}
        <section className="py-12 md:py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <SectionHeading eyebrow={product.name} title={product.tagline} />
              <p className="mt-6 text-sm leading-7 text-brand-text-secondary max-w-2xl">
                {product.description}
              </p>
              <p className="mt-4 text-sm leading-7 text-brand-text-secondary max-w-2xl">
                Speak with our team to discuss your financing needs and get a tailored offer.
                Interest rates, tenors and limits are confirmed at offer stage.
              </p>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-gold mb-4">
                  Start Your Application
                </h3>
                <p className="text-xs text-brand-text-secondary mb-5">
                  Have your business details and supporting documents ready.
                </p>
                <Link
                  to="/apply"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 font-bold text-brand-deep shadow-sm hover:bg-brand-gold-light transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-y border-brand-border">
          <SectionHeading eyebrow={product.name} title="Why Choose This Financing" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.benefits.map((benefit, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-brand-border bg-white shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-pale text-brand-gold">
                  {idx === 0 ? <ShieldCheck size={20} /> : idx === 1 ? <Users size={20} /> : <Target size={20} />}
                </div>
                <p className="mt-3 text-sm leading-6 text-brand-text-secondary">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-12">
          <SectionHeading eyebrow={product.name} title="How It Works" />
          <div className="mt-8 space-y-5">
            {product.howItWorks.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-brand-deep text-white font-bold text-sm">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm leading-6 text-brand-text-secondary">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility */}
        <section className="py-12 border-y border-brand-border bg-brand-light">
          <SectionHeading eyebrow={product.name} title="Eligibility Requirements" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {product.eligibility.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-white">
                <FileText size={18} className="shrink-0 text-brand-gold mt-0.5" />
                <p className="text-sm leading-6 text-brand-text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section className="py-12">
          <SectionHeading eyebrow={product.name} title="Required Documentation" />
          <div className="mt-8 space-y-3">
            {product.documents.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-white">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-brand-pale flex items-center justify-center text-sm font-bold text-brand-navy">
                  {idx + 1}
                </span>
                <p className="text-sm leading-6 text-brand-text-secondary">{doc}</p>
              </div>
            ))}
            <p className="mt-4 text-[11px] text-brand-text-secondary italic">
              Additional documents may be requested during credit review.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 border-y border-brand-border">
          <SectionHeading eyebrow={product.name} title="Frequently Asked Questions" />
          <FAQAccordion items={product.faqs} />
        </section>

        {/* Related products */}
        <section className="py-12">
          <SectionHeading
            eyebrow="Related Financing"
            title="You May Also Be Interested In"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.related.map((relatedId) => {
              const related = financingProducts[relatedId]
              if (!related) return null
              return (
                <ProductCard
                  key={related.id}
                  name={related.name}
                  description={related.tagline}
                  href={`/products/${related.id}`}
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
