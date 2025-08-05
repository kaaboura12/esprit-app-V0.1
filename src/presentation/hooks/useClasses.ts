import { useState, useEffect } from 'react'

export interface Class {
  id: number
  nom_classe: string
  bloc: string
  numclasse: number
}

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/classes', {
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
      setClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const refreshClasses = () => {
    fetchClasses()
  }

  const clearError = () => {
    setError(null)
  }

  return {
    classes,
    loading,
    error,
    refreshClasses,
    clearError
  }
} 