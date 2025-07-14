import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { 
  GetStudentNotesRequestDTO, 
  GetStudentNotesResponseDTO, 
  StudentNoteDTO, 
  NoteDTO, 
  SubjectWithConfigDTO,
  NoteConfigDTO 
} from "@/application/dtos/NoteDTO"

/**
 * Get Student Notes Use Case - Application layer
 * This handles the business logic for retrieving student notes for a specific subject and class
 */
export class GetStudentNotesUseCase {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(request: GetStudentNotesRequestDTO): Promise<GetStudentNotesResponseDTO> {
    try {
      // Validate input
      if (!request.matiereId || request.matiereId <= 0) {
        return {
          success: false,
          error: 'Valid subject ID is required'
        }
      }

      if (!request.classeId || request.classeId <= 0) {
        return {
          success: false,
          error: 'Valid class ID is required'
        }
      }

      // Get subject information
      const subject = await this.notesRepository.findSubjectById(request.matiereId)
      if (!subject) {
        return {
          success: false,
          error: 'Subject not found'
        }
      }

      // Get class information
      const classe = await this.notesRepository.findClassById(request.classeId)
      if (!classe) {
        return {
          success: false,
          error: 'Class not found'
        }
      }

      // Get note configuration for the subject
      const noteConfig = await this.notesRepository.findNoteConfigBySubject(request.matiereId)
      
      // Get all students in the class
      const students = await this.notesRepository.findStudentsByClass(request.classeId)
      
      // Get existing notes for this subject and class
      const existingNotes = await this.notesRepository.findNotesBySubjectAndClass(request.matiereId, request.classeId)
      
      // Create a map of student ID to note for quick lookup
      const notesMap = new Map<number, typeof existingNotes[0]>()
      existingNotes.forEach(note => {
        notesMap.set(note.getEtudiantId(), note)
      })

      // Combine students with their notes
      const studentNotes: StudentNoteDTO[] = students.map(student => {
        const note = notesMap.get(student.getId())
        
        let noteDTO: NoteDTO | null = null
        if (note) {
          noteDTO = {
            id: note.getId(),
            etudiantId: note.getEtudiantId(),
            matiereId: note.getMatiereId(),
            teacherId: note.getTeacherId(),
            noteCC: note.getNoteCC(),
            noteTP: note.getNoteTP(),
            noteDV: note.getNoteDV(),
            noteFinale: note.getNoteFinale(),
            gradeLetter: note.getGradeLetter(),
            isPassed: note.isPassed(),
            completionPercentage: note.getCompletionPercentage(noteConfig?.hasTPComponent() || false)
          }
        }

        return {
          studentId: student.getId(),
          studentFirstname: student.getFirstname(),
          studentLastname: student.getLastname(),
          studentEmail: student.getEmailValue(),
          studentNumero: student.getNumeroEtudiant().getValue(),
          age: student.getAge(),
          note: noteDTO
        }
      })

      // Create subject DTO with configuration
      let noteConfigDTO: NoteConfigDTO | null = null
      if (noteConfig) {
        noteConfigDTO = {
          id: noteConfig.getId(),
          matiereId: noteConfig.getMatiereId(),
          pourcentageCC: noteConfig.getPourcentageCC(),
          pourcentageTP: noteConfig.getPourcentageTP(),
          pourcentageDV: noteConfig.getPourcentageDV(),
          hasTPComponent: noteConfig.hasTPComponent(),
          dominantComponent: noteConfig.getDominantComponent()
        }
      }

      const subjectDTO: SubjectWithConfigDTO = {
        id: subject.getId(),
        nommatiere: subject.getNommatiere(),
        description: subject.getDescription(),
        coefficient: subject.getCoefficient(),
        noteConfig: noteConfigDTO
      }

      // Get statistics
      const statistics = await this.notesRepository.getNotesStatistics(request.matiereId, request.classeId)

      return {
        success: true,
        data: {
          subject: subjectDTO,
          className: classe.getFullIdentifier(),
          students: studentNotes,
          statistics
        }
      }

    } catch (error) {
      console.error('Error getting student notes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get student notes'
      }
    }
  }
} 