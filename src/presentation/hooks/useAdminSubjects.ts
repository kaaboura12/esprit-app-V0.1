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
  classe: {
    id: number
    nom_classe: string
    bloc: string
    numclasse: number
  }
}

interface NoteConfig {
  id: number
  pourcentage_cc: number
  pourcentage_tp: number
  pourcentage_dv: number
}

interface Subject {
  id: number
  nommatiere: string
  coefficient: number
  description: string | null
  noteConfig: NoteConfig | null
  teacherAssignments: TeacherAssignment[]
  uniqueTeachersCount: number
  uniqueClassesCount: number
  totalAssignments: number
  isImportant: boolean
  hasTPComponent: boolean
}

interface SubjectsResponse {
  subjects: Subject[]
  total: number
  statistics: {
    totalSubjects: number
    importantSubjects: number
    subjectsWithTP: number
    averageCoefficient: number
    subjectsByCoefficient: Record<string, number>
    totalAssignments: number
  }
}

export function useAdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [statistics, setStatistics] = useState<SubjectsResponse['statistics'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/subjects', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch subjects' }))
        throw new Error(errorData.error || 'Failed to fetch subjects')
      }

      const data: SubjectsResponse = await response.json()
      setSubjects(data.subjects)
      setStatistics(data.statistics)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return {
    subjects,
    statistics,
    loading,
    error,
    refreshSubjects: fetchSubjects
  }
} 