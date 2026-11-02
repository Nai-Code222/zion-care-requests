// src/services/staffRequests.ts
import { supabase } from '../utils/supabase'

// Staff read care_requests and activity_log directly. RLS lets these queries through only for
// users listed in the staff table; anyone else gets empty results, not an error.

const summaryColumns = `
  reference_code, first, last, anonymous_flag, created_at, archived_at, member_notes,
  request_type ( request_type ),
  urgency_type ( urgency, urgency_rank ),
  status_types ( status_type_id, status_type )
` as const

function listRequests(archived: boolean) {
  return supabase
    .from('care_requests')
    .select(summaryColumns)
    .eq('archived_flag', archived)
    .order(archived ? 'archived_at' : 'created_at', { ascending: false })
}

export type RequestSummary = NonNullable<Awaited<ReturnType<typeof listRequests>>['data']>[number]

// Requests that aren't Completed. The page sorts them, so switching sort doesn't refetch.
export async function getOpenRequests(): Promise<RequestSummary[]> {
  const { data, error } = await listRequests(false)
  if (error) throw error
  return data
}

// Completed requests, most recently archived first. Archived rows are kept, never deleted.
export async function getArchivedRequests(): Promise<RequestSummary[]> {
  const { data, error } = await listRequests(true)
  if (error) throw error
  return data
}

function detailQuery(code: string) {
  return supabase
    .from('care_requests')
    .select(`
      reference_code, first, last, phone, email, anonymous_flag, no_contact_flag,
      archived_flag, archived_at, created_at, updated_at, member_notes,
      request_type ( request_type ),
      urgency_type ( urgency, urgency_rank ),
      contact_method_types ( contact_method ),
      status_types ( status_type_id, status_type )
    `)
    .eq('reference_code', code)
    .maybeSingle()
}

// activity_log points to status_types twice, so each embed names the link it follows
function historyQuery(code: string) {
  return supabase
    .from('activity_log')
    .select(`
      activity_log_id, timestamp, internal_notes, member_message, old_status_id, new_status_id,
      old_status:status_types!activity_log_old_status_id_fkey ( status_type ),
      new_status:status_types!activity_log_new_status_id_fkey ( status_type )
    `)
    .eq('reference_code', code)
    .order('timestamp', { ascending: false })
}

export type RequestDetail = NonNullable<Awaited<ReturnType<typeof detailQuery>>['data']>
export type HistoryEntry = NonNullable<Awaited<ReturnType<typeof historyQuery>>['data']>[number]

// One request with everything staff can see, including internal notes, or null if no code matches
export async function getRequestDetail(
  code: string,
): Promise<{ request: RequestDetail; history: HistoryEntry[] } | null> {
  const [request, history] = await Promise.all([detailQuery(code), historyQuery(code)])
  if (request.error) throw request.error
  if (history.error) throw history.error
  if (!request.data) return null
  return { request: request.data, history: history.data }
}

// The member's name for staff views, or how they asked to be shown
export function requesterName(request: { first: string | null; last: string | null; anonymous_flag: boolean }) {
  if (request.anonymous_flag) return 'Anonymous'
  return [request.first, request.last].filter(Boolean).join(' ') || 'No name given'
}

export type RequestUpdateInput = {
  code: string
  statusId: number
  internalNote?: string
  memberMessage?: string
}

// Adds an activity_log row. The database fills in the old status and who made the change, moves
// the request to the new status, and archives it when the status is Completed. A status change
// without a member message gets a default one ("Status changed to …"), which is the notification
// stub: each row's member_message is what the email to the member would say.
export async function addRequestUpdate({ code, statusId, internalNote, memberMessage }: RequestUpdateInput) {
  // Reads the saved row back, since the database decides the old status
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      reference_code: code,
      new_status_id: statusId,
      internal_notes: internalNote?.trim() || null,
      member_message: memberMessage?.trim() || null,
    })
    .select(`
      activity_log_id, member_message,
      old_status:status_types!activity_log_old_status_id_fkey ( status_type ),
      new_status:status_types!activity_log_new_status_id_fkey ( status_type )
    `)
    .single()
  if (error) throw error

  // Notification stub, console side: prints the email the member would get. Every status change has
  // a message (the database adds a default), and a note for the member without one is emailed too.
  // The user chose to print the full text, member's name included, as the brief asks.
  if (data.member_message) {
    console.info(
      `[notification stub] Email for ${code} (${data.old_status.status_type} → ${data.new_status.status_type}, ` +
        `activity_log row ${data.activity_log_id}):\n${data.member_message}`,
    )
  }
}
