// src/services/careRequests.ts
import { supabase } from '../utils/supabase'
import type { Database } from '../types/database.types'

export type NewCareRequest = Database['public']['Functions']['submit_care_request']['Args']
export type RequestStatus = Database['public']['Functions']['get_care_request']['Returns'][number]
export type RequestUpdate = Database['public']['Functions']['get_request_updates']['Returns'][number]
export type LookupResult = { request: RequestStatus; updates: RequestUpdate[] }

// Saves a member's request through the submit_care_request database function and returns the
// reference code the database generated. Members aren't signed in, so they can't insert into
// care_requests directly; the function sets the starting status and leaves internal notes empty.
export async function submitCareRequest(request: NewCareRequest): Promise<string> {
  const { data, error } = await supabase.rpc('submit_care_request', request)
  if (error) throw error
  logConfirmationEmail(data)
  return data
}

// Notification stub, console side: prints the confirmation email the database saved with the new
// request. It's read back through the member lookup, since members can't read activity_log. Logging
// is best effort, so a failed read never turns a saved request into an error.
function logConfirmationEmail(code: string) {
  supabase
    .rpc('get_request_updates', { p_reference_code: code })
    .then(({ data }) => {
      const email = data?.find((update) => update.member_message)?.member_message
      console.info(
        email
          ? `[notification stub] Confirmation email for ${code}:\n${email}`
          : `[notification stub] No confirmation email for ${code}: the member chose No Contact.`,
      )
    })
}

// Finds a request by the reference code the member was given, or returns null if none matches.
// Both database functions return only status fields, the member's own description, and the
// messages written for the member, never contact details or internal notes.
export async function lookupCareRequest(code: string): Promise<LookupResult | null> {
  const [request, updates] = await Promise.all([
    supabase.rpc('get_care_request', { p_reference_code: code }).maybeSingle(),
    supabase.rpc('get_request_updates', { p_reference_code: code }),
  ])
  if (request.error) throw request.error
  if (updates.error) throw updates.error
  if (!request.data) return null
  return { request: request.data, updates: updates.data }
}
