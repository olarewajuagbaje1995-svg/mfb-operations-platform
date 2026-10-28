// Responsibility: role names. Must match the CHECK constraint on member_roles (migration 002).
export const ROLES = [
  'mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer',
  'reconciliation_officer', 'compliance_officer', 'support_officer', 'auditor', 'customer',
] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  mfb_admin: 'MFB Administrator',
  branch_manager: 'Branch Manager',
  loan_officer: 'Loan Officer',
  loan_approver: 'Loan Approver',
  kyc_reviewer: 'KYC Reviewer',
  reconciliation_officer: 'Reconciliation Officer',
  compliance_officer: 'Compliance Officer',
  support_officer: 'Customer Support Officer',
  auditor: 'Auditor / Read-Only Manager',
  customer: 'Customer',
}
// The Platform Administrator role is separate (platform_roles table) and not part of this list on purpose.