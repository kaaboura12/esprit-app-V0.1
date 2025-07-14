import { StudentRepository } from '@/core/interfaces/StudentRepository'
import { Etudiant } from '@/core/entities/Etudiant'
import { ExcelImportService, ExcelStudentData, ImportResult } from '@/infrastructure/services/ExcelImportService'
import { Email } from '@/core/value-objects/Email'
import { StudentNumber } from '@/core/value-objects/StudentNumber'

/**
 * Import Students from Excel Use Case - Application layer
 * This handles the business logic for importing students from Excel files
 */

export interface ImportStudentsRequest {
  fileBuffer: Buffer
  defaultClasseId: number
  overwriteExisting?: boolean
}

export interface ImportStudentsResponse {
  success: boolean
  message: string
  results: {
    totalRows: number
    validRows: number
    successfulImports: number
    failedImports: number
    skippedDuplicates: number
  }
  errors: string[]
  warnings: string[]
  importedStudents: {
    id: number
    fullName: string
    email: string
    numeroEtudiant: string
  }[]
}

export interface StudentImportResult {
  success: boolean
  student?: Etudiant
  error?: string
  isDuplicate?: boolean
  action: 'created' | 'updated' | 'skipped' | 'failed'
}

export class ImportStudentsFromExcelUseCase {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly excelImportService: ExcelImportService
  ) {}

  async execute(request: ImportStudentsRequest): Promise<ImportStudentsResponse> {
    try {
      // Parse Excel file
      const parseResult = await this.excelImportService.parseExcelFile(request.fileBuffer)
      
      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          message: 'Failed to parse Excel file',
          results: {
            totalRows: parseResult.totalRows || 0,
            validRows: 0,
            successfulImports: 0,
            failedImports: 0,
            skippedDuplicates: 0
          },
          errors: parseResult.errors || [],
          warnings: [],
          importedStudents: []
        }
      }

      // Process each student record
      const importResults = await this.processStudentRecords(
        parseResult.data,
        request.defaultClasseId,
        request.overwriteExisting || false
      )

      // Aggregate results
      const results = this.aggregateResults(importResults)
      
      // Generate response message
      const message = this.generateResponseMessage(results, parseResult.totalRows || 0)

      return {
        success: results.successfulImports > 0,
        message,
        results,
        errors: parseResult.errors || [],
        warnings: importResults
          .filter(r => r.action === 'skipped' && r.isDuplicate)
          .map(r => `Skipped duplicate: ${r.student?.getFullName() || 'Unknown'}`),
        importedStudents: importResults
          .filter(r => r.success && r.student && (r.action === 'created' || r.action === 'updated'))
          .map(r => ({
            id: r.student!.getId(),
            fullName: r.student!.getFullName(),
            email: r.student!.getEmailValue(),
            numeroEtudiant: r.student!.getNumeroEtudiantValue()
          }))
      }

    } catch (error) {
      console.error('Error in ImportStudentsFromExcelUseCase:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during import',
        results: {
          totalRows: 0,
          validRows: 0,
          successfulImports: 0,
          failedImports: 0,
          skippedDuplicates: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        importedStudents: []
      }
    }
  }

  /**
   * Process each student record from Excel
   */
  private async processStudentRecords(
    studentData: ExcelStudentData[],
    defaultClasseId: number,
    overwriteExisting: boolean
  ): Promise<StudentImportResult[]> {
    const results: StudentImportResult[] = []

    for (const data of studentData) {
      try {
        const result = await this.processStudentRecord(data, defaultClasseId, overwriteExisting)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          action: 'failed'
        })
      }
    }

    return results
  }

  /**
   * Process a single student record
   */
  private async processStudentRecord(
    data: ExcelStudentData,
    defaultClasseId: number,
    overwriteExisting: boolean
  ): Promise<StudentImportResult> {
    try {
      // Validate student data
      const validation = this.excelImportService.validateStudentData(data)
      if (!validation.isValid || !validation.data) {
        return {
          success: false,
          error: validation.errors.join(', '),
          action: 'failed'
        }
      }

      const validatedData = validation.data

      // Check for existing student by email
      const existingByEmail = await this.studentRepository.findByEmail(
        new Email(validatedData.email)
      )

      // Check for existing student by student number
      const existingByNumber = await this.studentRepository.findByStudentNumber(
        new StudentNumber(validatedData.numeroEtudiant)
      )

      // Handle duplicates
      if (existingByEmail || existingByNumber) {
        if (!overwriteExisting) {
          return {
            success: false,
            student: existingByEmail || existingByNumber,
            isDuplicate: true,
            action: 'skipped'
          }
        }

        // Update existing student
        const existingStudent = existingByEmail || existingByNumber
        if (existingStudent) {
          const updatedStudent = this.updateExistingStudent(
            existingStudent,
            validatedData,
            defaultClasseId
          )
          
          await this.studentRepository.save(updatedStudent)
          
          return {
            success: true,
            student: updatedStudent,
            action: 'updated'
          }
        }
      }

      // Create new student
      const newStudent = Etudiant.create(
        0, // ID will be set by database
        validatedData.firstname,
        validatedData.lastname,
        validatedData.email,
        defaultClasseId,
        validatedData.numeroEtudiant,
        validatedData.dateNaissance
      )

      const createdStudent = await this.studentRepository.create(newStudent)

      return {
        success: true,
        student: createdStudent,
        action: 'created'
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'failed'
      }
    }
  }

  /**
   * Update existing student with new data
   */
  private updateExistingStudent(
    existingStudent: Etudiant,
    newData: {
      firstname: string
      lastname: string
      email: string
      numeroEtudiant: string
      dateNaissance?: Date
    },
    defaultClasseId: number
  ): Etudiant {
    // Create updated student with new data
    return Etudiant.create(
      existingStudent.getId(),
      newData.firstname,
      newData.lastname,
      newData.email,
      defaultClasseId, // Use default class ID for imports
      newData.numeroEtudiant,
      newData.dateNaissance || existingStudent.getDateNaissance()
    )
  }

  /**
   * Aggregate import results
   */
  private aggregateResults(importResults: StudentImportResult[]): {
    totalRows: number
    validRows: number
    successfulImports: number
    failedImports: number
    skippedDuplicates: number
  } {
    const totalRows = importResults.length
    const validRows = importResults.filter(r => r.action !== 'failed').length
    const successfulImports = importResults.filter(r => 
      r.success && (r.action === 'created' || r.action === 'updated')
    ).length
    const failedImports = importResults.filter(r => r.action === 'failed').length
    const skippedDuplicates = importResults.filter(r => 
      r.action === 'skipped' && r.isDuplicate
    ).length

    return {
      totalRows,
      validRows,
      successfulImports,
      failedImports,
      skippedDuplicates
    }
  }

  /**
   * Generate response message
   */
  private generateResponseMessage(
    results: {
      totalRows: number
      validRows: number
      successfulImports: number
      failedImports: number
      skippedDuplicates: number
    },
    totalExcelRows: number
  ): string {
    const { successfulImports, failedImports, skippedDuplicates } = results

    if (successfulImports === 0) {
      return `Import failed. No students were imported. ${failedImports} failed, ${skippedDuplicates} skipped.`
    }

    let message = `Import completed successfully. ${successfulImports} students imported.`
    
    if (failedImports > 0) {
      message += ` ${failedImports} failed.`
    }
    
    if (skippedDuplicates > 0) {
      message += ` ${skippedDuplicates} duplicates skipped.`
    }

    return message
  }

  /**
   * Validate import request
   */
  validateRequest(request: ImportStudentsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.fileBuffer || request.fileBuffer.length === 0) {
      errors.push('File buffer is required')
    }

    if (!request.defaultClasseId || request.defaultClasseId <= 0) {
      errors.push('Valid class ID is required')
    }

    return { isValid: errors.length === 0, errors }
  }
} 