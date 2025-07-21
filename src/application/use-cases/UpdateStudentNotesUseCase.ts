import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { NoteFinale } from "@/core/entities/NoteFinale"
import { 
  UpdateStudentNoteRequestDTO, 
  UpdateStudentNoteResponseDTO, 
  BatchUpdateNotesRequestDTO,
  BatchUpdateNotesResponseDTO,
  NoteDTO 
} from "@/application/dtos/NoteDTO"

/**
 * Update Student Notes Use Case - Application layer
 * This handles the business logic for updating student notes
 */
export class UpdateStudentNotesUseCase {
  constructor(private readonly notesRepository: NotesRepository) {}

  async updateSingleNote(request: UpdateStudentNoteRequestDTO, teacherId: number): Promise<UpdateStudentNoteResponseDTO> {
    try {
      // Validate input
      if (!request.etudiantId || request.etudiantId <= 0) {
        return {
          success: false,
          error: 'Valid student ID is required'
        }
      }

      if (!request.matiereId || request.matiereId <= 0) {
        return {
          success: false,
          error: 'Valid subject ID is required'
        }
      }

      if (!teacherId || teacherId <= 0) {
        return {
          success: false,
          error: 'Valid teacher ID is required'
        }
      }

      // Validate note values
      if (request.noteCC !== undefined && request.noteCC !== null && (request.noteCC < 0 || request.noteCC > 20)) {
        return {
          success: false,
          error: 'CC note must be between 0 and 20'
        }
      }

      if (request.noteTP !== undefined && request.noteTP !== null && (request.noteTP < 0 || request.noteTP > 20)) {
        return {
          success: false,
          error: 'TP note must be between 0 and 20'
        }
      }

      if (request.noteDV !== undefined && request.noteDV !== null && (request.noteDV < 0 || request.noteDV > 20)) {
        return {
          success: false,
          error: 'DV note must be between 0 and 20'
        }
      }

      // Check if student exists
      const student = await this.notesRepository.findStudentById(request.etudiantId)
      if (!student) {
        return {
          success: false,
          error: 'Student not found'
        }
      }

      // Check if subject exists
      const subject = await this.notesRepository.findSubjectById(request.matiereId)
      if (!subject) {
        return {
          success: false,
          error: 'Subject not found'
        }
      }

      // Find existing note
      const existingNote = await this.notesRepository.findNoteByStudentAndSubject(request.etudiantId, request.matiereId)
      
      let updatedNote: NoteFinale

      if (existingNote) {
        // Update existing note
        const noteCC = request.noteCC !== undefined ? request.noteCC : existingNote.getNoteCC()
        const noteTP = request.noteTP !== undefined ? request.noteTP : existingNote.getNoteTP()
        const noteDV = request.noteDV !== undefined ? request.noteDV : existingNote.getNoteDV()

        const noteToUpdate = existingNote.withUpdatedNotes(noteCC, noteTP, noteDV)
        updatedNote = await this.notesRepository.updateNote(noteToUpdate)
      } else {
        // Create new note
        const newNote = NoteFinale.create(
          request.etudiantId,
          request.matiereId,
          teacherId,
          request.noteCC || null,
          request.noteTP || null,
          request.noteDV || null
        )
        updatedNote = await this.notesRepository.saveNote(newNote)
      }

      // Get note configuration to calculate completion percentage
      const noteConfig = await this.notesRepository.findNoteConfigBySubject(request.matiereId)

      // Convert to DTO
      const noteDTO: NoteDTO = {
        id: updatedNote.getId(),
        etudiantId: updatedNote.getEtudiantId(),
        matiereId: updatedNote.getMatiereId(),
        teacherId: updatedNote.getTeacherId(),
        noteCC: updatedNote.getNoteCC(),
        noteTP: updatedNote.getNoteTP(),
        noteDV: updatedNote.getNoteDV(),
        noteFinale: updatedNote.getNoteFinale(),
        gradeLetter: updatedNote.getGradeLetter(),
        isPassed: updatedNote.isPassed(),
        completionPercentage: updatedNote.getCompletionPercentage(noteConfig?.hasTPComponent() || false)
      }

      return {
        success: true,
        note: noteDTO
      }

    } catch (error) {
      console.error('Error updating student note:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update student note'
      }
    }
  }

  async batchUpdateNotes(request: BatchUpdateNotesRequestDTO, teacherId: number): Promise<BatchUpdateNotesResponseDTO> {
    try {
      // Validate input
      if (!request.matiereId || request.matiereId <= 0) {
        return {
          success: false,
          error: 'Valid subject ID is required'
        }
      }

      if (!teacherId || teacherId <= 0) {
        return {
          success: false,
          error: 'Valid teacher ID is required'
        }
      }

      if (!request.notes || request.notes.length === 0) {
        return {
          success: false,
          error: 'At least one note update is required'
        }
      }

      // Check if subject exists
      const subject = await this.notesRepository.findSubjectById(request.matiereId)
      if (!subject) {
        return {
          success: false,
          error: 'Subject not found'
        }
      }

      const notesToUpdate: NoteFinale[] = []
      const errors: string[] = []
      let successful = 0

      // Process each note update
      for (const noteRequest of request.notes) {
        try {
          // Validate note values
          if (noteRequest.noteCC !== undefined && noteRequest.noteCC !== null && (noteRequest.noteCC < 0 || noteRequest.noteCC > 20)) {
            errors.push(`Student ${noteRequest.etudiantId}: CC note must be between 0 and 20`)
            continue
          }

          if (noteRequest.noteTP !== undefined && noteRequest.noteTP !== null && (noteRequest.noteTP < 0 || noteRequest.noteTP > 20)) {
            errors.push(`Student ${noteRequest.etudiantId}: TP note must be between 0 and 20`)
            continue
          }

          if (noteRequest.noteDV !== undefined && noteRequest.noteDV !== null && (noteRequest.noteDV < 0 || noteRequest.noteDV > 20)) {
            errors.push(`Student ${noteRequest.etudiantId}: DV note must be between 0 and 20`)
            continue
          }

          // Check if student exists
          const student = await this.notesRepository.findStudentById(noteRequest.etudiantId)
          if (!student) {
            errors.push(`Student ${noteRequest.etudiantId}: Student not found`)
            continue
          }

          // Find existing note
          const existingNote = await this.notesRepository.findNoteByStudentAndSubject(noteRequest.etudiantId, request.matiereId)
          
          if (existingNote) {
            // Update existing note
            const noteCC = noteRequest.noteCC !== undefined ? noteRequest.noteCC : existingNote.getNoteCC()
            const noteTP = noteRequest.noteTP !== undefined ? noteRequest.noteTP : existingNote.getNoteTP()
            const noteDV = noteRequest.noteDV !== undefined ? noteRequest.noteDV : existingNote.getNoteDV()

            const noteToUpdate = existingNote.withUpdatedNotes(noteCC, noteTP, noteDV)
            notesToUpdate.push(noteToUpdate)
          } else {
            // Create new note
            const newNote = NoteFinale.create(
              noteRequest.etudiantId,
              request.matiereId,
              teacherId,
              noteRequest.noteCC || null,
              noteRequest.noteTP || null,
              noteRequest.noteDV || null
            )
            notesToUpdate.push(newNote)
          }

          successful++

        } catch (error) {
          errors.push(`Student ${noteRequest.etudiantId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Perform batch update
      if (notesToUpdate.length > 0) {
        try {
          await this.notesRepository.batchUpdateNotes(notesToUpdate)
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to batch update notes'
          }
        }
      }

      return {
        success: true,
        results: {
          successful,
          failed: errors.length,
          errors
        }
      }

    } catch (error) {
      console.error('Error batch updating notes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch update notes'
      }
    }
  }
} 