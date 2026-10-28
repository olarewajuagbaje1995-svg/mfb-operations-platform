import { AlertTriangle, CheckCircle2, Info, Loader2, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

// Responsibility: loading, empty, and message states reused on every page.
export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 p-8 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-white p-10 text-center">
      <Inbox className="h-8 w-8 text-muted" aria-hidden="true" />
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}

type Tone = 'info' | 'success' | 'error' | 'warning'
const TONES: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: 'border-blue-200 bg-blue-50 text-blue-900', icon: <Info className="h-4 w-4" aria-hidden="true" /> },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> },
  error: { box: 'border-red-200 bg-red-50 text-red-900', icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
}

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const t = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-2 rounded-md border p-3 text-sm ${t.box}`}>
      <span className="mt-0.5">{t.icon}</span>
      <div>{children}</div>
    </div>
  )
}