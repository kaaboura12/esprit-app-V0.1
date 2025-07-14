/**
 * Application DTOs - Data Transfer Objects for Excel Notes Import
 * These are used to transfer data between layers for Excel import operations
 */

// Request DTOs
export interface ImportNotesFromExcelRequestDTO {
  matiereId: number
  classeId: number
  overwriteExisting: boolean
  validateOnly?: boolean
}

export interface ExcelNoteRowDTO {
  prenom: string
  nom: string
  email?: string
  numeroetudiant: string
  noteCC?: number
  noteTP?: number
  noteDV?: number
}

export interface ProcessedNoteRowDTO {
  studentId?: number
  studentFirstname: string
  studentLastname: string
  studentEmail?: string
  studentNumero: string
  noteCC?: number
  noteTP?: number
  noteDV?: number
  isExistingStudent: boolean
  isExistingNote: boolean
  finalGrade?: number
  errors: string[]
  warnings: string[]
}

// Response DTOs
export interface ImportNotesFromExcelResponseDTO {
  success: boolean
  error?: string
  message?: string
  results?: ImportNotesResultsDTO
}

export interface ImportNotesResultsDTO {
  totalRows: number
  validRows: number
  processedRows: number
  successfulImports: number
  failedImports: number
  skippedDuplicates: number
  updatedNotes: number
  createdNotes: number
  studentsNotFound: number
  hasTPComponent: boolean
  statistics: {
    averageCC?: number
    averageTP?: number
    averageDV?: number
    averageFinal?: number
    passRate: number
    completionRate: number
  }
  importedNotes: ImportedNoteDTO[]
  errors: string[]
  warnings: string[]
  processingDetails: ProcessedNoteRowDTO[]
}

export interface ImportedNoteDTO {
  id: number
  studentId: number
  studentFullName: string
  studentNumero: string
  noteCC?: number
  noteTP?: number
  noteDV?: number
  noteFinale?: number
  gradeLetter: string
  isPassed: boolean
  isUpdated: boolean
  isCreated: boolean
}

// Validation DTOs
export interface ValidateExcelNotesRequestDTO {
  matiereId: number
  classeId: number
}

export interface ValidateExcelNotesResponseDTO {
  success: boolean
  error?: string
  validation?: {
    totalRows: number
    validRows: number
    invalidRows: number
    hasTPComponent: boolean
    requiredColumns: string[]
    foundColumns: string[]
    missingColumns: string[]
    errors: string[]
    warnings: string[]
    sampleData: ExcelNoteRowDTO[]
  }
}

// Progress tracking DTOs
export interface ImportProgressDTO {
  stage: 'parsing' | 'validating' | 'processing' | 'saving' | 'completed'
  progress: number
  message: string
  currentRow?: number
  totalRows?: number
  errors?: string[]
  warnings?: string[]
}

export interface BatchImportResultDTO {
  batchNumber: number
  processed: number
  successful: number
  failed: number
  errors: string[]
  warnings: string[]
  importedNotes: ImportedNoteDTO[]
}

// Subject context DTO
export interface SubjectContextDTO {
  id: number
  name: string
  description?: string
  coefficient: number
  hasTPComponent: boolean
  noteConfig: {
    pourcentageCC: number
    pourcentageTP: number
    pourcentageDV: number
  }
}

// Class context DTO
export interface ClassContextDTO {
  id: number
  name: string
  bloc: string
  numClasse: number
  totalStudents: number
  studentsWithNotes: number
}

// Template generation DTO
export interface GenerateTemplateRequestDTO {
  matiereId: number
  classeId: number
  includeExistingNotes: boolean
  includeStudentEmails: boolean
}

export interface GenerateTemplateResponseDTO {
  success: boolean
  error?: string
  templateData?: {
    filename: string
    headers: string[]
    sampleData: any[][]
    students: {
      prenom: string
      nom: string
      email?: string
      numeroetudiant: string
      noteCC?: number
      noteTP?: number
      noteDV?: number
    }[]
    hasTPComponent: boolean
    subjectName: string
    className: string
  }
}

// Error handling DTOs
export interface ImportErrorDTO {
  type: 'validation' | 'processing' | 'database' | 'system'
  code: string
  message: string
  details?: any
  rowIndex?: number
  columnName?: string
  studentInfo?: {
    prenom: string
    nom: string
    numeroetudiant: string
  }
}

export interface ImportWarningDTO {
  type: 'data' | 'formatting' | 'duplicate' | 'missing'
  code: string
  message: string
  details?: any
  rowIndex?: number
  columnName?: string
  studentInfo?: {
    prenom: string
    nom: string
    numeroetudiant: string
  }
}

// Summary DTOs
export interface ImportSummaryDTO {
  importId: string
  timestamp: Date
  teacherId: number
  matiereId: number
  classeId: number
  filename: string
  totalRows: number
  successfulImports: number
  failedImports: number
  duration: number
  status: 'completed' | 'partial' | 'failed'
}

export interface ImportHistoryDTO {
  imports: ImportSummaryDTO[]
  totalImports: number
  successfulImports: number
  failedImports: number
  lastImportDate?: Date
} 