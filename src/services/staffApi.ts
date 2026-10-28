import { supabase } from '@/lib/supabase'

export async function getPipeline(orgId: string) {
  const { data, error } = await supabase
    .from('loan_applications')
    .select(`
      id, reference, status, full_name, requested_amount, submitted_at,
      loan_products (name),
      assigned_officer_id
    `)
    .eq('org_id', orgId)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error('Failed to load pipeline.')
  return data
}

export async function getApplicationDetails(appId: string, orgId: string) {
  const { data, error } = await supabase
    .from('loan_applications')
    .select(`
      *,
      loan_products (*),
      customers (customer_number, kyc_status),
      application_documents (*),
      application_status_history (from_status, to_status, reason, created_at, changed_by),
      application_notes (body, created_at, author_id)
    `)
    .eq('id', appId)
    .eq('org_id', orgId)
    .single()

  if (error) throw new Error('Failed to load application details.')
  
  // Explicitly filter documents by org_id if needed, or return data as-is
  return data
}

export async function assignOfficer(appId: string, orgId: string, officerId: string) {
  const { error } = await supabase
    .from('loan_applications')
    .update({ assigned_officer_id: officerId })
    .eq('id', appId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to assign officer.')
}

export async function addApplicationNote(appId: string, orgId: string, authorId: string, body: string) {
  const { error } = await supabase
    .from('application_notes')
    .insert({
      org_id: orgId,
      application_id: appId,
      author_id: authorId,
      body: body
    })

  if (error) throw new Error('Failed to add note.')
}

export async function updateDocumentReviewStatus(
  docId: string, 
  orgId: string, 
  reviewerId: string, 
  status: 'accepted' | 'rejected' | 'replacement_requested', 
  comment?: string,
  extractedData?: any
) {
  const { error } = await supabase
    .from('application_documents')
    .update({
      review_status: status,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_comment: comment || null,
      ocr_extracted_text: extractedData || null
    })
    .eq('id', docId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to update document review status.')
}

export async function transitionApplicationStatus(
  appId: string, 
  orgId: string, 
  toStatus: string, 
  reason?: string
) {
  const { data, error } = await supabase.rpc('transition_application', {
    p_application_id: appId,
    p_org_id: orgId,
    p_to_status: toStatus,
    p_reason: reason || null
  })

  if (error) throw new Error(error.message || 'Status transition failed.')
  return data
}

export async function submitCreditAssessment(appId: string, orgId: string, payload: any) {
  const { data, error } = await supabase.rpc('submit_credit_assessment', {
    p_application_id: appId,
    p_org_id: orgId,
    p_payload: payload
  })

  if (error) throw new Error(error.message || 'Failed to submit credit assessment.')
  return data
}

export async function decideApplication(appId: string, orgId: string, decision: 'approve' | 'decline', reason: string) {
  const { data, error } = await supabase.rpc('decide_application', {
    p_application_id: appId,
    p_org_id: orgId,
    p_decision: decision,
    p_reason: reason
  })

  if (error) throw new Error(error.message || `Failed to ${decision} application.`)
  return data
}

export async function simulateDisbursement(appId: string, orgId: string) {
  const { data, error } = await supabase.rpc('simulate_disbursement', {
    p_application_id: appId,
    p_org_id: orgId
  })

  if (error) throw new Error(error.message || 'Simulated disbursement failed.')
  return data
}

// --- Complaints Management ---

export async function getComplaints(orgId: string) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load complaints.')
  return data
}

export async function resolveComplaint(complaintId: string, orgId: string, resolutionNotes: string) {
  const { error } = await supabase
    .from('complaints')
    .update({ 
      status: 'resolved', 
      resolution_notes: resolutionNotes,
      resolved_at: new Date().toISOString()
    })
    .eq('id', complaintId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to resolve complaint.')
}

// --- Dashboard Metrics ---

export async function getDashboardMetrics(orgId: string) {
  const { data: pipelineData, error: pipelineError } = await supabase
    .from('loan_applications')
    .select('status, requested_amount')
    .eq('org_id', orgId)

  if (pipelineError) throw new Error('Failed to fetch pipeline metrics.')

  const { count: complaintsCount, error: complaintsError } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'investigating')

  if (complaintsError) throw new Error('Failed to fetch complaints metrics.')

  let activeCount = 0
  let activeVolume = 0
  let pendingApprovalCount = 0

  const CLOSED_STATUSES = ['approved', 'declined', 'disbursed', 'cancelled']

  pipelineData?.forEach(app => {
    if (!CLOSED_STATUSES.includes(app.status)) {
      activeCount++
      activeVolume += Number(app.requested_amount || 0)
    }
    if (app.status === 'awaiting_approval') {
      pendingApprovalCount++
    }
  })

  return {
    activeCount,
    activeVolume,
    pendingApprovalCount,
    unresolvedComplaints: complaintsCount || 0
  }
}

// --- Admin Settings (Loan Products) ---

export async function getAdminProducts(orgId: string) {
  const { data, error } = await supabase
    .from('loan_products')
    .select('*')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  if (error) throw new Error('Failed to load loan products.')
  return data
}

export async function toggleProductStatus(productId: string, orgId: string, isActive: boolean) {
  const { error } = await supabase
    .from('loan_products')
    .update({ is_active: isActive })
    .eq('id', productId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to update product status.')
}

export async function createLoanProduct(payload: {
  org_id: string
  code: string
  name: string
  description?: string
  eligibility_notes?: string
  min_amount: number
  max_amount: number
  min_term_months: number
  max_term_months: number
  annual_interest_pct: number
  interest_method: 'reducing_balance' | 'flat'
  fee_pct: number
}) {
  const { data, error } = await supabase
    .from('loan_products')
    .insert([payload])
    .select()
    .single()
    
  if (error) throw new Error(error.message || 'Failed to create product.')
  return data
}

// --- Audit Trail & Reports ---

export async function getAuditLogs(orgId: string) {
  const { data, error } = await supabase
    .from('application_status_history')
    .select(`
      id, from_status, to_status, reason, created_at, changed_by,
      loan_applications (reference, full_name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error('Failed to load audit logs.')
  return data
}