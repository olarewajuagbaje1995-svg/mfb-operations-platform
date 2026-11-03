import { supabase } from '@/lib/supabase'
import type { ApplicationValues, ComplaintValues } from '@/schemas/application'

export async function getPublicOrg(slug: string) {
  const { data, error } = await supabase.rpc('get_public_org', { p_slug: slug })
  if (error) throw new Error('Could not load bank details.')
  if (!data || data.length === 0) throw new Error('Bank not found or inactive.')
  return data[0]
}

export async function getActiveProducts(orgId: string) {
  const { data, error } = await supabase
    .from('loan_products')
    .select('id, code, name, description, eligibility_notes, min_amount, max_amount, min_term_months, max_term_months, annual_interest_pct, interest_method, fee_pct')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('name')
    
  if (error) throw new Error('Could not load loan products.')
  return data || []
}

export async function submitApplication(orgSlug: string, idempotencyKey: string, payload: ApplicationValues) {
  const { data, error } = await supabase.rpc('submit_public_application', {
    p_org_slug: orgSlug,
    p_idempotency_key: idempotencyKey,
    p_payload: payload,
  })
  
  if (error) throw new Error(error.message || 'Failed to submit application.')
  return data as { reference: string; tracking_code?: string; application_id: string; org_id: string; duplicate: boolean }
}

export async function trackApplication(reference: string, code: string) {
  const { data, error } = await supabase.rpc('track_application', {
    p_reference: reference,
    p_code: code,
  })
  
  if (error) throw new Error(error.message || 'Reference or tracking code not recognised.')
  return Array.isArray(data) ? data[0] : data
}

// --- Complaints ---

export async function submitComplaint(orgSlug: string, idempotencyKey: string, payload: any) {
  // Safely map frontend/schema fields to what the Supabase RPC function (p_payload jsonb) expects
  const rpcPayload = {
    category: payload.category,
    subject: payload.subject,
    description: payload.description,
    severity: payload.severity || 'medium',
    contact_name: payload.contact_name || payload.full_name,
    contact_phone: payload.contact_phone || payload.phone,
    contact_email: payload.contact_email || payload.email,
  }

  const { data, error } = await supabase.rpc('submit_public_complaint', {
    p_org_slug: orgSlug,
    p_idempotency_key: idempotencyKey,
    p_payload: rpcPayload,
  })
  
  if (error) throw new Error(error.message || 'Failed to submit complaint.')
  return data as { reference: string; tracking_code?: string; complaint_id: string; duplicate: boolean }
}

export async function trackComplaint(reference: string, code: string) {
  const { data, error } = await supabase.rpc('track_complaint', {
    p_reference: reference,
    p_code: code,
  })
  
  if (error) throw new Error(error.message || 'Reference or tracking code not recognised.')
  return Array.isArray(data) ? data[0] : data
}