// Responsibility: the one source of truth for application status values and labels.
export const APPLICATION_STATUSES = [
  'new_application', 'initial_review', 'documents_required', 'kyc_review',
  'credit_assessment', 'awaiting_approval', 'approved', 'ready_for_disbursement',
  'active_loan', 'repayment_monitoring', 'completed', 'declined', 'cancelled',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new_application: 'New Application',
  initial_review: 'Initial Review',
  documents_required: 'Documents Required',
  kyc_review: 'KYC Review',
  credit_assessment: 'Credit Assessment',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  ready_for_disbursement: 'Ready for Simulated Disbursement',
  active_loan: 'Active Loan',
  repayment_monitoring: 'Repayment Monitoring',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

export const FINAL_STATUSES: ApplicationStatus[] = ['completed', 'declined', 'cancelled']