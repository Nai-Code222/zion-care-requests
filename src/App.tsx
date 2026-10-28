import './App.css'

import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import type { Tables } from './types/database.types'

type StatusType = Tables<'status_types'>

export default function App() {
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getStatusTypes() {
      const { data, error } = await supabase
        .from('status_types')
        .select('status_type_id, status_type')
        .order('status_type_id')

      if (error) {
        setError(error.message)
        return
      }
      setStatusTypes(data)
    }

    getStatusTypes()
  }, [])

  if (error) return <p role="alert">Could not load status types: {error}</p>

  return (
    <ul>
      {statusTypes.map((status) => (
        <li key={status.status_type_id}>{status.status_type}</li>
      ))}
    </ul>
  )
}
