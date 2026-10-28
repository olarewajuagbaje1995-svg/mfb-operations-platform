import type { Role } from '@/types/roles'

export interface NavItem {
  to: string
  label: string
  roles: Role[]
  end?: boolean
}

// Responsibility: Sidebar navigation configuration for the staff portal.
export const STAFF_NAV: NavItem[] = [
  {
    to: '/staff',
    label: 'Overview',
    end: true,
    roles: ['mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer', 'reconciliation_officer', 'compliance_officer', 'support_officer', 'auditor'],
  },
  {
    to: '/staff/pipeline',
    label: 'Loan Pipeline',
    end: false,
    roles: ['mfb_admin', 'branch_manager', 'loan_officer', 'loan_approver', 'kyc_reviewer', 'auditor'],
  },
  {
    to: '/staff/complaints',
    label: 'Complaints',
    end: false,
    roles: ['mfb_admin', 'branch_manager', 'support_officer', 'compliance_officer', 'auditor'],
  },
  {
    to: '/staff/audit',
    label: 'Audit Trail',
    end: false,
    roles: ['mfb_admin', 'branch_manager', 'compliance_officer', 'auditor'],
  },
  {
    to: '/staff/settings',
    label: 'Settings',
    end: false,
    roles: ['mfb_admin', 'auditor'],
  },
]