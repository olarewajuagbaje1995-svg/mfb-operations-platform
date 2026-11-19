import { STATUS_LABELS, type ApplicationStatus } from '@/types/status'

const COLOURS: Record<ApplicationStatus, string> = {
  new_application: 'bg-brand-pale text-brand-navy',
  initial_review: 'bg-brand-pale text-brand-navy',
  documents_required: 'bg-amber-100 text-amber-800',
  kyc_review: 'bg-brand-pale text-brand-navy',
  credit_assessment: 'bg-brand-pale text-brand-navy',
  awaiting_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  ready_for_disbursement: 'bg-teal-100 text-teal-800',
  active_loan: 'bg-green-100 text-green-800',
  repayment_monitoring: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-slate-200 text-slate-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-600',
}

// Responsibility: consistent public-facing application status label.
export function ApplicationStatus({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOURS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
