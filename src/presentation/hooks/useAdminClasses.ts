import { useState, useEffect } from 'react'

interface TeacherAssignment {
  id: number
  teacher: {
    id: number
    firstname: string
    lastname: string
    email: string
    departement: string
  }
  matiere: {
    id: number
    nommatiere: string
    coefficient: number
  }
}

interface Class {
  id: number
  nomClasse: string
  bloc: string
  numclasse: number
  nbreEtudiantMax: number
  nbreEtudiantActuel: number
  teacherAssignments: TeacherAssignment[]
  capacityPercentage: number
  availableSpots: number
}

interface ClassesResponse {
  classes: Class[]
  total: number
  statistics: {
    totalClasses: number
    totalStudents: number
    averageCapacity: number
    fullClasses: number
    emptyClasses: number
  }
}

export function useAdminClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [statistics, setStatistics] = useState<ClassesResponse['statistics'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/classes', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch classes' }))
        throw new Error(errorData.error || 'Failed to fetch classes')
      }

      const data: ClassesResponse = await response.json()
      setClasses(data.classes)
      setStatistics(data.statistics)
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  return {
    classes,
    statistics,
    loading,
    error,
    refreshClasses: fetchClasses
  }
} 