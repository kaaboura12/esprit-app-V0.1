import { useState, useEffect } from 'react'
import { Teacher } from '@/core/entities/Teacher'
import { GetTeacherUseCase } from '@/application/use-cases/GetTeacherUseCase'
import { InMemoryTeacherRepository } from '@/infrastructure/repositories/InMemoryTeacherRepository'

/**
 * Custom Hook - Presentation layer
 * This hook connects the UI to the use cases for teachers
 */
export function useTeacher(teacherId: number | null) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teacherId) return

    const fetchTeacher = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Dependency injection - in a real app, this would be done at a higher level
        const teacherRepository = new InMemoryTeacherRepository()
        const getTeacherUseCase = new GetTeacherUseCase(teacherRepository)
        
        const fetchedTeacher = await getTeacherUseCase.execute(teacherId)
        setTeacher(fetchedTeacher)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [teacherId])

  return { teacher, loading, error }
} 