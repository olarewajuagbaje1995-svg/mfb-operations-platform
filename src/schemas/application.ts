import { z } from 'zod'

// Matches the CHECK constraints in migration 004
export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(120),
  phone: z.string().trim().regex(/^\+?[0-9]{7,20}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  address: z.string().trim().min(5, 'Enter your full address'),
  customer_type: z.enum(['salaried', 'self_employed', 'small_business', 'other'], {
    message: 'Select a customer type',
  }),
  employer_or_business: z.string().trim().optional(),
  monthly_income: z.coerce.number().min(0, 'Income cannot be negative'),
  monthly_expenses: z.coerce.number().min(0, 'Expenses cannot be negative').optional(),
  
  loan_product_id: z.string().uuid('Select a loan product'),
  requested_amount: z.coerce.number().positive('Enter a valid amount'),
  requested_term_months: z.coerce.number().int().positive('Enter a valid term in months'),
  purpose: z.string().trim().min(3, 'Briefly describe the purpose of the loan'),
  
  consent_given: z.literal(true, {
    message: 'You must accept the declaration to apply',
  }),
})

export type ApplicationValues = z.infer<typeof applicationSchema>

export const trackSchema = z.object({
  reference: z.string().trim().min(5, 'Enter your application reference (e.g. MFB-...)'),
  code: z.string().trim().length(12, 'Tracking code must be exactly 12 characters'),
})

export type TrackValues = z.infer<typeof trackSchema>

// --- Complaints ---

export const complaintSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().trim().regex(/^\+?[0-9]{7,20}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  related_reference: z.string().trim().optional(),
  subject: z.string().trim().min(3, 'Enter a subject for your complaint'),
  description: z.string().trim().min(10, 'Please provide more details about your complaint'),
})

export type ComplaintValues = z.infer<typeof complaintSchema>

export const trackComplaintSchema = z.object({
  reference: z.string().trim().min(5, 'Enter your complaint reference (e.g. CMP-...)'),
  code: z.string().trim().length(12, 'Tracking code must be exactly 12 characters'),
})

export type TrackComplaintValues = z.infer<typeof trackComplaintSchema>