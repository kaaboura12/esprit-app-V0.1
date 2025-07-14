import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { ExcelNotesImportService, ExcelNoteData } from "@/infrastructure/services/ExcelNotesImportService"
import { NoteFinale } from "@/core/entities/NoteFinale"
import { NoteConfig } from "@/core/entities/NoteConfig"
import { Etudiant } from "@/core/entities/Etudiant"
import { Matiere } from "@/core/entities/Matiere"
import { Classe } from "@/core/entities/Classe"
import {
  ImportNotesFromExcelRequestDTO,
  ImportNotesFromExcelResponseDTO,
  ImportNotesResultsDTO,
  ProcessedNoteRowDTO,
  ImportedNoteDTO,
  GenerateTemplateRequestDTO,
  GenerateTemplateResponseDTO
} from "@/application/dtos/ExcelNotesImportDTO"

/**
 * Import Notes From Excel Use Case - Application layer
 * This use case handles the business logic for importing notes from Excel files
 */
export class ImportNotesFromExcelUseCase {
  constructor(
    private notesRepository: NotesRepository,
    private excelImportService: ExcelNotesImportService
  ) {}

  /**
   * Import notes from Excel file
   */
  async execute(
    fileBuffer: Buffer,
    request: ImportNotesFromExcelRequestDTO,
    teacherId: number,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ImportNotesFromExcelResponseDTO> {
    try {
      onProgress?.(5, 'Starting import process...')

      // Validate subject and class
      const [subject, classe, students] = await Promise.all([
        this.notesRepository.findSubjectById(request.matiereId),
        this.notesRepository.findClassById(request.classeId),
        this.notesRepository.findStudentsByClass(request.classeId)
      ])

      if (!subject) {
        return {
          success: false,
          error: 'Subject not found'
        }
      }

      if (!classe) {
        return {
          success: false,
          error: 'Class not found'
        }
      }

      if (students.length === 0) {
        return {
          success: false,
          error: 'No students found in the specified class'
        }
      }

      onProgress?.(10, 'Validating Excel file...')

      // Parse Excel file
      const parseResult = await this.excelImportService.parseExcelFileWithProgress(
        fileBuffer,
        (progress, message) => {
          onProgress?.(10 + (progress * 0.3), message)
        }
      )

      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          error: 'Failed to parse Excel file',
          results: {
            totalRows: parseResult.totalRows || 0,
            validRows: 0,
            processedRows: 0,
            successfulImports: 0,
            failedImports: 0,
            skippedDuplicates: 0,
            updatedNotes: 0,
            createdNotes: 0,
            studentsNotFound: 0,
            hasTPComponent: false,
            statistics: {
              passRate: 0,
              completionRate: 0
            },
            importedNotes: [],
            errors: parseResult.errors || [],
            warnings: parseResult.warnings || [],
            processingDetails: []
          }
        }
      }

      onProgress?.(40, 'Processing student data...')

      // Get note configuration
      const noteConfig = await this.notesRepository.findNoteConfigBySubject(request.matiereId)
      if (!noteConfig) {
        return {
          success: false,
          error: 'Note configuration not found for this subject'
        }
      }

      // Process each row
      const processingResults = await this.processExcelData(
        parseResult.data,
        students,
        subject,
        classe,
        noteConfig,
        teacherId,
        request.overwriteExisting,
        onProgress
      )

      onProgress?.(90, 'Finalizing import...')

      // Calculate statistics
      const statistics = this.calculateStatistics(processingResults.importedNotes)

      const results: ImportNotesResultsDTO = {
        totalRows: parseResult.totalRows || 0,
        validRows: parseResult.validRows || 0,
        processedRows: processingResults.processedRows,
        successfulImports: processingResults.successfulImports,
        failedImports: processingResults.failedImports,
        skippedDuplicates: processingResults.skippedDuplicates,
        updatedNotes: processingResults.updatedNotes,
        createdNotes: processingResults.createdNotes,
        studentsNotFound: processingResults.studentsNotFound,
        hasTPComponent: parseResult.hasTPComponent || false,
        statistics,
        importedNotes: processingResults.importedNotes,
        errors: [...(parseResult.errors || []), ...processingResults.errors],
        warnings: [...(parseResult.warnings || []), ...processingResults.warnings],
        processingDetails: processingResults.processingDetails
      }

      onProgress?.(100, 'Import completed successfully')

      return {
        success: true,
        message: `Successfully imported ${processingResults.successfulImports} notes`,
        results
      }

    } catch (error) {
      console.error('Error importing notes from Excel:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during import'
      }
    }
  }

  /**
   * Generate Excel template for notes import
   */
  async generateTemplate(request: GenerateTemplateRequestDTO): Promise<GenerateTemplateResponseDTO> {
    try {
      // Validate subject and class
      const [subject, classe, students, noteConfig] = await Promise.all([
        this.notesRepository.findSubjectById(request.matiereId),
        this.notesRepository.findClassById(request.classeId),
        this.notesRepository.findStudentsByClass(request.classeId),
        this.notesRepository.findNoteConfigBySubject(request.matiereId)
      ])

      if (!subject) {
        return {
          success: false,
          error: 'Subject not found'
        }
      }

      if (!classe) {
        return {
          success: false,
          error: 'Class not found'
        }
      }

      if (!noteConfig) {
        return {
          success: false,
          error: 'Note configuration not found for this subject'
        }
      }

      // Prepare headers
      const headers = ['prenom', 'nom', 'numeroetudiant']
      
      if (request.includeStudentEmails) {
        headers.push('email')
      }

      headers.push('noteCC')
      
      if (noteConfig.hasTPComponent()) {
        headers.push('noteTP')
      }
      
      headers.push('noteDV')

      // Prepare student data
      const studentData = []
      
      for (const student of students) {
        const row: any = {
          prenom: student.getFirstname(),
          nom: student.getLastname(),
          numeroetudiant: student.getNumeroEtudiant().getValue()
        }

        if (request.includeStudentEmails) {
          row.email = student.getEmailValue()
        }

        if (request.includeExistingNotes) {
          // Get existing notes for this student
          const existingNote = await this.notesRepository.findNoteByStudentAndSubject(
            student.getId(),
            request.matiereId
          )

          if (existingNote) {
            row.noteCC = existingNote.getNoteCC()
            if (noteConfig.hasTPComponent()) {
              row.noteTP = existingNote.getNoteTP()
            }
            row.noteDV = existingNote.getNoteDV()
          } else {
            row.noteCC = ''
            if (noteConfig.hasTPComponent()) {
              row.noteTP = ''
            }
            row.noteDV = ''
          }
        } else {
          row.noteCC = ''
          if (noteConfig.hasTPComponent()) {
            row.noteTP = ''
          }
          row.noteDV = ''
        }

        studentData.push(row)
      }

      // Create sample data for template
      const sampleData = [
        headers,
        ['Ahmed', 'Ben Ali', '2021001234', ...(request.includeStudentEmails ? ['ahmed.benali@esprit.tn'] : []), '15.5', ...(noteConfig.hasTPComponent() ? ['14.0'] : []), '16.0'],
        ['Fatima', 'Zahra', '2022005678', ...(request.includeStudentEmails ? ['fatima.zahra@esprit.tn'] : []), '17.0', ...(noteConfig.hasTPComponent() ? ['15.5'] : []), '18.0']
      ]

      const filename = `notes_import_${subject.getNomMatiere()}_${classe.getNomClasse()}_${new Date().toISOString().split('T')[0]}.xlsx`

      return {
        success: true,
        templateData: {
          filename,
          headers,
          sampleData,
          students: studentData,
          hasTPComponent: noteConfig.hasTPComponent(),
          subjectName: subject.getNomMatiere(),
          className: classe.getNomClasse()
        }
      }

    } catch (error) {
      console.error('Error generating template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while generating template'
      }
    }
  }

  /**
   * Process Excel data and create/update notes
   */
  private async processExcelData(
    excelData: ExcelNoteData[],
    students: Etudiant[],
    subject: Matiere,
    classe: Classe,
    noteConfig: NoteConfig,
    teacherId: number,
    overwriteExisting: boolean,
    onProgress?: (progress: number, message: string) => void
  ): Promise<{
    processedRows: number
    successfulImports: number
    failedImports: number
    skippedDuplicates: number
    updatedNotes: number
    createdNotes: number
    studentsNotFound: number
    importedNotes: ImportedNoteDTO[]
    errors: string[]
    warnings: string[]
    processingDetails: ProcessedNoteRowDTO[]
  }> {
    const results = {
      processedRows: 0,
      successfulImports: 0,
      failedImports: 0,
      skippedDuplicates: 0,
      updatedNotes: 0,
      createdNotes: 0,
      studentsNotFound: 0,
      importedNotes: [] as ImportedNoteDTO[],
      errors: [] as string[],
      warnings: [] as string[],
      processingDetails: [] as ProcessedNoteRowDTO[]
    }

    // Create student lookup map
    const studentLookup = new Map<string, Etudiant>()
    students.forEach(student => {
      studentLookup.set(student.getNumeroEtudiant().getValue().toLowerCase(), student)
    })

    // Process each row
    for (let i = 0; i < excelData.length; i++) {
      const rowData = excelData[i]
      const rowIndex = i + 1
      
      onProgress?.(50 + Math.round((i / excelData.length) * 35), `Processing row ${rowIndex} of ${excelData.length}`)

      const processedRow: ProcessedNoteRowDTO = {
        studentFirstname: rowData.prenom,
        studentLastname: rowData.nom,
        studentEmail: rowData.email,
        studentNumero: rowData.numeroetudiant,
        noteCC: rowData.noteCC,
        noteTP: rowData.noteTP,
        noteDV: rowData.noteDV,
        isExistingStudent: false,
        isExistingNote: false,
        errors: [],
        warnings: []
      }

      // Find student
      const student = studentLookup.get(rowData.numeroetudiant.toLowerCase())
      if (!student) {
        processedRow.errors.push(`Student with number ${rowData.numeroetudiant} not found in class`)
        results.studentsNotFound++
        results.failedImports++
        results.processingDetails.push(processedRow)
        continue
      }

      processedRow.studentId = student.getId()
      processedRow.isExistingStudent = true

      // Check if note already exists
      const existingNote = await this.notesRepository.findNoteByStudentAndSubject(
        student.getId(),
        subject.getId()
      )

      if (existingNote) {
        processedRow.isExistingNote = true
        
        if (!overwriteExisting) {
          processedRow.warnings.push('Note already exists and overwrite is disabled')
          results.skippedDuplicates++
          results.processingDetails.push(processedRow)
          continue
        }
      }

      // Validate notes based on note configuration
      if (!noteConfig.hasTPComponent() && rowData.noteTP !== undefined) {
        processedRow.warnings.push('TP note provided but subject does not have TP component')
      }

      // Create or update note
      try {
        let noteEntity: NoteFinale

        if (existingNote) {
          // Update existing note
          noteEntity = new NoteFinale(
            existingNote.getId(),
            student.getId(),
            subject.getId(),
            teacherId,
            rowData.noteCC ?? existingNote.getNoteCC(),
            rowData.noteTP ?? existingNote.getNoteTP(),
            rowData.noteDV ?? existingNote.getNoteDV(),
            null // Will be calculated by database trigger
          )
          
          noteEntity = await this.notesRepository.updateNote(noteEntity)
          results.updatedNotes++
        } else {
          // Create new note
          noteEntity = new NoteFinale(
            0,
            student.getId(),
            subject.getId(),
            teacherId,
            rowData.noteCC ?? null,
            rowData.noteTP ?? null,
            rowData.noteDV ?? null,
            null // Will be calculated by database trigger
          )
          
          noteEntity = await this.notesRepository.saveNote(noteEntity)
          results.createdNotes++
        }

        // Calculate final grade using note configuration
        const finalGrade = noteConfig.calculateFinalGrade(
          noteEntity.getNoteCC(),
          noteEntity.getNoteTP(),
          noteEntity.getNoteDV()
        )

        processedRow.finalGrade = finalGrade

        // Create imported note DTO
        const importedNote: ImportedNoteDTO = {
          id: noteEntity.getId(),
          studentId: student.getId(),
          studentFullName: `${student.getFirstname()} ${student.getLastname()}`,
          studentNumero: student.getNumeroEtudiant().getValue(),
          noteCC: noteEntity.getNoteCC(),
          noteTP: noteEntity.getNoteTP(),
          noteDV: noteEntity.getNoteDV(),
          noteFinale: noteEntity.getNoteFinale(),
          gradeLetter: noteEntity.getGradeLetter(),
          isPassed: noteEntity.isPassed(),
          isUpdated: existingNote !== null,
          isCreated: existingNote === null
        }

        results.importedNotes.push(importedNote)
        results.successfulImports++

      } catch (error) {
        processedRow.errors.push(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.failedImports++
        results.errors.push(`Row ${rowIndex}: ${processedRow.errors.join(', ')}`)
      }

      results.processedRows++
      results.processingDetails.push(processedRow)
    }

    return results
  }

  /**
   * Calculate statistics from imported notes
   */
  private calculateStatistics(importedNotes: ImportedNoteDTO[]): {
    averageCC?: number
    averageTP?: number
    averageDV?: number
    averageFinal?: number
    passRate: number
    completionRate: number
  } {
    if (importedNotes.length === 0) {
      return {
        passRate: 0,
        completionRate: 0
      }
    }

    const notesWithCC = importedNotes.filter(note => note.noteCC !== null && note.noteCC !== undefined)
    const notesWithTP = importedNotes.filter(note => note.noteTP !== null && note.noteTP !== undefined)
    const notesWithDV = importedNotes.filter(note => note.noteDV !== null && note.noteDV !== undefined)
    const notesWithFinal = importedNotes.filter(note => note.noteFinale !== null && note.noteFinale !== undefined)

    const averageCC = notesWithCC.length > 0 
      ? notesWithCC.reduce((sum, note) => sum + (note.noteCC || 0), 0) / notesWithCC.length
      : undefined

    const averageTP = notesWithTP.length > 0 
      ? notesWithTP.reduce((sum, note) => sum + (note.noteTP || 0), 0) / notesWithTP.length
      : undefined

    const averageDV = notesWithDV.length > 0 
      ? notesWithDV.reduce((sum, note) => sum + (note.noteDV || 0), 0) / notesWithDV.length
      : undefined

    const averageFinal = notesWithFinal.length > 0 
      ? notesWithFinal.reduce((sum, note) => sum + (note.noteFinale || 0), 0) / notesWithFinal.length
      : undefined

    const passedNotes = importedNotes.filter(note => note.isPassed)
    const passRate = (passedNotes.length / importedNotes.length) * 100

    const completedNotes = importedNotes.filter(note => 
      note.noteCC !== null && note.noteCC !== undefined &&
      note.noteDV !== null && note.noteDV !== undefined
    )
    const completionRate = (completedNotes.length / importedNotes.length) * 100

    return {
      averageCC: averageCC ? Math.round(averageCC * 100) / 100 : undefined,
      averageTP: averageTP ? Math.round(averageTP * 100) / 100 : undefined,
      averageDV: averageDV ? Math.round(averageDV * 100) / 100 : undefined,
      averageFinal: averageFinal ? Math.round(averageFinal * 100) / 100 : undefined,
      passRate: Math.round(passRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100
    }
  }
} 