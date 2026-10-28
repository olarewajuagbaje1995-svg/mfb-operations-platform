import { Link } from 'react-router-dom'
import { env } from '@/lib/env'

// Responsibility: temporary public landing page; replaced by the full homepage in Part 3.
export default function HomePage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold text-navy-900">{env.appName}</h1>
      <p className="max-w-2xl text-muted">A fictional microfinance bank used to demonstrate an operations platform. Loan products, application and tracking pages arrive in Part 3.</p>
      <Link to="/login" className="text-brand-600 underline">Staff login</Link>
    </section>
  )
}