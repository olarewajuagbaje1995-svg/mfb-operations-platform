import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  to: string
}

// Responsibility: breadcrumb navigation derived from the current route.
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-[11px] font-bold text-brand-text-secondary uppercase tracking-widest" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <div key={item.label} className="flex items-center gap-1">
            {!last ? (
              <Link to={item.to} className="hover:text-brand-navy transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-text-secondary">{item.label}</span>
            )}
            {!last && <ChevronRight size={14} aria-hidden="true" />}
          </div>
        )
      })}
    </nav>
  )
}
