import { useState, useEffect } from 'react'

export interface Subject {
  id: number
  nommatiere: string
  coefficient: number
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/subjects', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSubjects(data || [])
    } catch (err) {
      console.error('Error fetching subjects:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const refreshSubjects = () => {
    fetchSubjects()
  }

  const clearError = () => {
    setError(null)
  }

  return {
    subjects,
    loading,
    error,
    refreshSubjects,
    clearError
  }
} 