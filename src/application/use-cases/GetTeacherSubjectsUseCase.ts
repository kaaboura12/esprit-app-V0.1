import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { 
  GetTeacherSubjectsResponseDTO, 
  TeacherSubjectDTO 
} from "@/application/dtos/NoteDTO"

/**
 * Get Teacher Subjects Use Case - Application layer
 * This handles the business logic for retrieving teacher's subject assignments for notes management
 */
export class GetTeacherSubjectsUseCase {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(teacherId: number): Promise<GetTeacherSubjectsResponseDTO> {
    try {
      // Validate input
      if (!teacherId || teacherId <= 0) {
        return {
          success: false,
          error: 'Valid teacher ID is required'
        }
      }

      // Get teacher's subject assignments
      const assignments = await this.notesRepository.findTeacherSubjectAssignments(teacherId)
      
      if (assignments.length === 0) {
        return {
          success: true,
          subjects: []
        }
      }

      // Convert to DTOs and calculate additional information
      const subjectsDTO: TeacherSubjectDTO[] = []
      
      for (const assignment of assignments) {
        // Check if there are any notes for this subject-class combination
        const existingNotes = await this.notesRepository.findNotesBySubjectAndClass(
          assignment.matiereId, 
          assignment.classeId
        )
        
        const hasNotes = existingNotes.length > 0
        
        // Calculate completion rate
        const totalStudents = assignment.studentCount
        const studentsWithNotes = existingNotes.length
        const completionRate = totalStudents > 0 ? Math.round((studentsWithNotes / totalStudents) * 100) : 0
        
        const subjectDTO: TeacherSubjectDTO = {
          id: assignment.teacherClasseId,
          matiereId: assignment.matiereId,
          classeId: assignment.classeId,
          subjectName: assignment.subjectName,
          className: `${assignment.className}-${assignment.numClasse}`,
          bloc: assignment.bloc,
          numClasse: assignment.numClasse,
          studentCount: assignment.studentCount,
          hasNotes,
          completionRate
        }
        
        subjectsDTO.push(subjectDTO)
      }

      // Sort by subject name, then by class name
      subjectsDTO.sort((a, b) => {
        const subjectComparison = a.subjectName.localeCompare(b.subjectName)
        if (subjectComparison !== 0) return subjectComparison
        return a.className.localeCompare(b.className)
      })

      return {
        success: true,
        subjects: subjectsDTO
      }

    } catch (error) {
      console.error('Error getting teacher subjects:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get teacher subjects'
      }
    }
  }
} 