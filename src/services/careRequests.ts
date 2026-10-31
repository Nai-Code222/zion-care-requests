// src/services/careRequests.ts
import { supabase } from '../utils/supabase'
import type { Database } from '../types/database.types'

export type NewCareRequest = Database['public']['Functions']['submit_care_request']['Args']

// Saves a member's request through the submit_care_request database function and returns the
// reference code the database generated. Members aren't signed in, so they can't insert into
// care_requests directly; the function sets the starting status and leaves internal notes empty.
export async function submitCareRequest(request: NewCareRequest): Promise<string> {
  const { data, error } = await supabase.rpc('submit_care_request', request)
  if (error) throw error
  return data
}
