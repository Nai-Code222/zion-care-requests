// src/services/lookups.ts
import { supabase } from '../utils/supabase'
import type { Tables } from '../types/database.types'

export type RequestType = Tables<'request_type'>
export type UrgencyType = Tables<'urgency_type'>
export type ContactMethod = Tables<'contact_method_types'>
export type StatusType = Tables<'status_types'>

// Returns all rows from the request_type table, ordered by request_type_id (the primary key). The dashboard only needs status_types, so it calls getStatusTypes() directly.
export async function getRequestTypes(): Promise<RequestType[]> {
  const { data, error } = await supabase
    .from('request_type')
    .select('request_type_id, request_type')
    .order('request_type_id')
  if (error) throw error
  
  return data
}

// Returns all rows from the urgency_type table, ordered by urgency_rank (most urgent first).
export async function getUrgencyTypes(): Promise<UrgencyType[]> {
  const { data, error } = await supabase
    .from('urgency_type')
    .select('urgency_type_id, urgency, urgency_rank')
    .order('urgency_rank', { ascending: false })
  if (error) throw error
  return data
}


// Returns all rows from the contact_method_types table, ordered by contact_method_type_id (the primary key).
export async function getContactMethods(): Promise<ContactMethod[]> {
  const { data, error } = await supabase
    .from('contact_method_types')
    .select('contact_method_type_id, contact_method')
    .order('contact_method_type_id')
  if (error) throw error
  return data
}

// Returns all rows from the status_types table, ordered by status_type_id (the primary key).
export async function getStatusTypes(): Promise<StatusType[]> {
  const { data, error } = await supabase
    .from('status_types')
    .select('status_type_id, status_type')
    .order('status_type_id')
  if (error) throw error
  return data
}

// Single call to return all three lookup tables for the request form. The dashboard only needs status_types, so it calls getStatusTypes() directly.
export async function getRequestFormChoices() {
  const [requestTypes, urgencyTypes, contactMethods] = await Promise.all([
    getRequestTypes(),
    getUrgencyTypes(),
    getContactMethods(),
  ])
  return { requestTypes, urgencyTypes, contactMethods }
}

export type RequestFormChoices = Awaited<ReturnType<typeof getRequestFormChoices>>
