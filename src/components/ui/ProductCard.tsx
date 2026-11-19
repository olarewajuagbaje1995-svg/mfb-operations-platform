import { Link } from 'react-router-dom'

interface ProductCardProps {
  name: string
  description: string
  href?: string
  image?: string
}

// Responsibility: consistent financing product card with subtle hover effect.
export function ProductCard({ name, description, href, image }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {image ? (
        <img src={image} alt={name} className="h-48 w-full object-cover" loading="lazy" />
      ) : (
        <div className="h-48 flex items-center justify-center border-b border-brand-border bg-brand-light">
          <span className="text-2xl font-bold text-brand-navy">
            {name.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-navy">{name}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-text-secondary">{description}</p>
        {href && (
          <Link
            to={href}
            className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-navy hover:text-brand-gold transition-colors"
          >
            Learn more
            <span aria-hidden="true"> →</span>
          </Link>
        )}
      </div>
    </article>
  )
}
