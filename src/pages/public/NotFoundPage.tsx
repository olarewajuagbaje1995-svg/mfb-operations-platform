import { Link } from 'react-router-dom'

// Responsibility: branded 404 page for the public website.
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-pale text-brand-navy font-bold text-2xl mb-6">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">Page Not Found</h1>
        <p className="text-brand-text-secondary mb-8 max-w-xs mx-auto">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-6 py-3 rounded-xl bg-brand-gold text-brand-deep font-bold hover:bg-brand-gold-light transition-colors">
            Go Home
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl border border-brand-border text-brand-navy font-semibold hover:bg-brand-light transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
