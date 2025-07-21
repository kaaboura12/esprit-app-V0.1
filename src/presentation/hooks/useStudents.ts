import { useState, useEffect } from 'react'
import { StudentResponseDTO, StudentListResponseDTO } from '@/application/dtos/StudentDTO'

export interface AddStudentRequest {
  firstname: string
  lastname: string
  email: string
  numeroEtudiant: string
  classeId: number
  dateNaissance?: string
}

/**
 * Custom Hook - Presentation layer
 * This hook connects the UI to the student API
 */
export function useStudents(classeId: number | null) {
  const [students, setStudents] = useState<StudentResponseDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classeName, setClasseName] = useState<string | null>(null)

  const fetchStudents = async () => {
    if (!classeId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/students?classeId=${classeId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch students')
      }

      const data: StudentListResponseDTO = await response.json()
      setStudents(data.students)
      setClasseName(data.classeName || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [classeId])

  const refreshStudents = () => {
    fetchStudents()
  }

  const filterStudents = (searchTerm: string) => {
    if (!searchTerm.trim()) return students

    const term = searchTerm.toLowerCase()
    return students.filter(student =>
      student.firstname.toLowerCase().includes(term) ||
      student.lastname.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.numeroEtudiant.toLowerCase().includes(term)
    )
  }

  const addStudent = async (studentData: AddStudentRequest): Promise<void> => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student')
      }

      // Refresh the students list after successful creation
      await fetchStudents()
    } catch (err) {
      throw err // Re-throw to let the component handle the error
    }
  }

  const getStatistics = () => {
    const total = students.length
    const adults = students.filter(s => s.isAdult).length
    const minors = students.filter(s => !s.isAdult).length
    const newStudents = students.filter(s => s.status === 'new').length
    const seniors = students.filter(s => s.status === 'senior').length
    const averageAge = total > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / total) : 0

    return {
      total,
      adults,
      minors,
      newStudents,
      seniors,
      averageAge
    }
  }

  return {
    students,
    loading,
    error,
    classeName,
    refreshStudents,
    filterStudents,
    addStudent,
    getStatistics
  }
} 