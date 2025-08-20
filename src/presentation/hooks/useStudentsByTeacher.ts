import { useState, useEffect } from 'react'
import { StudentByTeacherDTO } from '@/application/dtos/StudentByTeacherDTO'

interface UseStudentsByTeacherReturn {
  students: StudentByTeacherDTO[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStudentsByTeacher(teacherId: number | null): UseStudentsByTeacherReturn {
  const [students, setStudents] = useState<StudentByTeacherDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    if (!teacherId) {
      setStudents([])
      setTotal(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teachers/students?teacher_id=${teacherId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStudents(data.students || [])
      setTotal(data.total || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students'
      setError(errorMessage)
      console.error('Error fetching students by teacher:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [teacherId])

  const refetch = () => {
    fetchStudents()
  }

  return {
    students,
    total,
    loading,
    error,
    refetch
  }
}
