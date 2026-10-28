import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Responsibility: the single Supabase client for the browser.
// Uses the PUBLISHABLE key only. Never place a service-role / secret key in frontend code.
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})