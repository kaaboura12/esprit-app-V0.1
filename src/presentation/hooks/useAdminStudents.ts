import { useState, useEffect } from 'react'

interface Classe {
  id: number
  nom_classe: string
  bloc: string
  numclasse: number
}

interface Student {
  id: number
  firstname: string
  lastname: string
  email: string
  numeroEtudiant: string
  dateNaissance: string | null
  age: number | null
  classe: Classe | null
  fullName: string
  initials: string
  status: string
  generation: string
  academicYear: string
}

interface StudentsResponse {
  students: Student[]
  total: number
  statistics: {
    totalStudents: number
    averageAge: number
    studentsByClass: Record<string, number>
    studentsByBloc: Record<string, number>
    totalClasses: number
    totalBlocs: number
  }
}

export function useAdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [statistics, setStatistics] = useState<StudentsResponse['statistics'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/students', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch students' }))
        throw new Error(errorData.error || 'Failed to fetch students')
      }

      const data: StudentsResponse = await response.json()
      setStudents(data.students)
      setStatistics(data.statistics)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    statistics,
    loading,
    error,
    refreshStudents: fetchStudents
  }
} 