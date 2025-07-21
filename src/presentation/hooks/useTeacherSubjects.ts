import { useState, useEffect } from 'react'
import { 
  GetTeacherSubjectsResponseDTO, 
  TeacherSubjectDTO
} from '@/application/dtos/NoteDTO'

/**
 * Custom Hook - Presentation layer
 * This hook manages teacher subjects state and API calls for notes navigation
 */
export function useTeacherSubjects() {
  const [subjects, setSubjects] = useState<TeacherSubjectDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/notes/subjects', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: GetTeacherSubjectsResponseDTO = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch teacher subjects')
      }

      setSubjects(data.subjects || [])
    } catch (err) {
      console.error('Error fetching teacher subjects:', err)
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

  // Helper functions
  const getSubjectsByMatiere = () => {
    const grouped = subjects.reduce((acc, subject) => {
      if (!acc[subject.subjectName]) {
        acc[subject.subjectName] = []
      }
      acc[subject.subjectName].push(subject)
      return acc
    }, {} as Record<string, TeacherSubjectDTO[]>)

    // Sort classes within each subject
    Object.keys(grouped).forEach(subjectName => {
      grouped[subjectName].sort((a, b) => a.className.localeCompare(b.className))
    })

    return grouped
  }

  const getStatistics = () => {
    const totalSubjects = subjects.length
    const subjectsWithNotes = subjects.filter(s => s.hasNotes).length
    const averageCompletion = subjects.length > 0 
      ? Math.round(subjects.reduce((sum, s) => sum + s.completionRate, 0) / subjects.length)
      : 0
    const totalStudents = subjects.reduce((sum, s) => sum + s.studentCount, 0)

    return {
      totalSubjects,
      subjectsWithNotes,
      averageCompletion,
      totalStudents,
      completionRate: totalSubjects > 0 ? Math.round((subjectsWithNotes / totalSubjects) * 100) : 0
    }
  }

  const filterSubjects = (searchTerm: string) => {
    if (!searchTerm) return subjects
    
    return subjects.filter(subject => 
      subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.bloc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return {
    subjects,
    loading,
    error,
    refreshSubjects,
    clearError,
    getSubjectsByMatiere,
    getStatistics,
    filterSubjects
  }
} 