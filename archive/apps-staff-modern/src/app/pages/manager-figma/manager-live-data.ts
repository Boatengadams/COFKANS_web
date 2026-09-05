import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type ManagerRecord = Record<string, unknown> & { id: string }

export function useManagerCollection<T extends ManagerRecord>(collectionName: string) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRows([])
    setLoading(true)
    setError(null)
    return onSnapshot(
      collection(db, collectionName),
      snapshot => {
        setRows(snapshot.docs.map(document => ({ id: document.id, ...document.data() } as T)))
        setLoading(false)
      },
      () => {
        setRows([])
        setLoading(false)
        setError('The connected database could not be read.')
      },
    )
  }, [collectionName])

  return { rows, loading, error }
}

export function displayValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return '—'
}

export function dateValue(value: unknown): string {
  if (!value) return '—'
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return ((value as { toDate: () => Date }).toDate()).toLocaleDateString()
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}
