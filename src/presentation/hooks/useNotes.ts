import { useState, useEffect } from 'react'
import { 
  GetStudentNotesResponseDTO, 
  UpdateStudentNoteRequestDTO, 
  UpdateStudentNoteResponseDTO,
  BatchUpdateNotesRequestDTO,
  BatchUpdateNotesResponseDTO,
  StudentNoteDTO,
  SubjectWithConfigDTO
} from '@/application/dtos/NoteDTO'

/**
 * Custom Hook - Presentation layer
 * This hook manages notes state and API calls
 */
export function useNotes(matiereId: number | null, classeId: number | null) {
  const [students, setStudents] = useState<StudentNoteDTO[]>([])
  const [subject, setSubject] = useState<SubjectWithConfigDTO | null>(null)
  const [className, setClassName] = useState<string>('')
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    studentsWithNotes: 0,
    averageGrade: null as number | null,
    passRate: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchNotes = async () => {
    if (!matiereId || !classeId) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notes/students?matiereId=${matiereId}&classeId=${classeId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: GetStudentNotesResponseDTO = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch student notes')
      }

      if (data.data) {
        setStudents(data.data.students)
        setSubject(data.data.subject)
        setClassName(data.data.className)
        setStatistics(data.data.statistics)
      }
    } catch (err) {
      console.error('Error fetching student notes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStudents([])
      setSubject(null)
      setClassName('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [matiereId, classeId])

  const updateNote = async (studentId: number, noteData: Partial<UpdateStudentNoteRequestDTO>): Promise<boolean> => {
    if (!matiereId) return false

    setUpdateLoading(true)
    
    try {
      const requestData: UpdateStudentNoteRequestDTO = {
        etudiantId: studentId,
        matiereId: matiereId,
        ...noteData
      }

      const response = await fetch('/api/notes/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data: UpdateStudentNoteResponseDTO = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update note')
      }

      // Update local state in real-time
      if (data.note) {
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.studentId === studentId 
              ? { ...student, note: data.note! }
              : student
          )
        )

        // Update statistics in real-time
        setStatistics(prevStats => {
          const updatedStudents = students.map(student => 
            student.studentId === studentId 
              ? { ...student, note: data.note! }
              : student
          )

          // Calculate new statistics
          const totalStudents = updatedStudents.length
          const studentsWithNotes = updatedStudents.filter(s => 
            s.note?.noteCC !== null || s.note?.noteTP !== null || s.note?.noteDV !== null
          ).length

          // Calculate average grade
          const studentsWithFinalGrades = updatedStudents.filter(s => s.note && s.note.noteFinale !== null)
          const averageGrade = studentsWithFinalGrades.length > 0
            ? Math.round(studentsWithFinalGrades.reduce((sum, s) => sum + (s.note!.noteFinale || 0), 0) / studentsWithFinalGrades.length * 100) / 100
            : null

          // Calculate pass rate
          const passedStudents = updatedStudents.filter(s => s.note && s.note.noteFinale !== null && s.note.noteFinale >= 10).length
          const passRate = studentsWithFinalGrades.length > 0 
            ? Math.round((passedStudents / studentsWithFinalGrades.length) * 100)
            : 0

          // Calculate completion rate
          const completionRate = totalStudents > 0 
            ? Math.round((studentsWithNotes / totalStudents) * 100)
            : 0

          return {
            totalStudents,
            studentsWithNotes,
            averageGrade,
            passRate,
            completionRate
          }
        })
      }
      
      return true
    } catch (err) {
      console.error('Error updating note:', err)
      setError(err instanceof Error ? err.message : 'Failed to update note')
      return false
    } finally {
      setUpdateLoading(false)
    }
  }

  const batchUpdateNotes = async (notes: UpdateStudentNoteRequestDTO[]): Promise<boolean> => {
    if (!matiereId) return false

    setUpdateLoading(true)
    
    try {
      const requestData: BatchUpdateNotesRequestDTO = {
        matiereId: matiereId,
        notes: notes
      }

      const response = await fetch('/api/notes/update', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data: BatchUpdateNotesResponseDTO = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to batch update notes')
      }

      // For batch updates, we'll refresh the data since multiple students are involved
      // This ensures all statistics are properly recalculated
      await fetchNotes()
      
      return true
    } catch (err) {
      console.error('Error batch updating notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to batch update notes')
      return false
    } finally {
      setUpdateLoading(false)
    }
  }

  const refreshNotes = () => {
    fetchNotes()
  }

  const clearError = () => {
    setError(null)
  }

  // Helper functions
  const getStudentNote = (studentId: number) => {
    return students.find(s => s.studentId === studentId)?.note || null
  }

  const hasTPComponent = () => {
    return subject?.noteConfig?.hasTPComponent || false
  }

  const getGradeColor = (grade: number | string | null) => {
    if (grade === null || grade === undefined) return 'text-gray-400'
    const numGrade = typeof grade === 'string' ? parseFloat(grade) : grade
    if (isNaN(numGrade)) return 'text-gray-400'
    if (numGrade >= 16) return 'text-green-600'
    if (numGrade >= 14) return 'text-blue-600'
    if (numGrade >= 12) return 'text-yellow-600'
    if (numGrade >= 10) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCompletionColor = (percentage: number | string) => {
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage
    if (isNaN(numPercentage)) return 'text-gray-600'
    if (numPercentage === 100) return 'text-green-600'
    if (numPercentage >= 67) return 'text-blue-600'
    if (numPercentage >= 33) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filterStudents = (searchTerm: string) => {
    if (!searchTerm) return students
    
    return students.filter(student => 
      student.studentFirstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentLastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumero.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return {
    students,
    subject,
    className,
    statistics,
    loading,
    error,
    updateLoading,
    updateNote,
    batchUpdateNotes,
    refreshNotes,
    clearError,
    getStudentNote,
    hasTPComponent,
    getGradeColor,
    getCompletionColor,
    filterStudents
  }
} 