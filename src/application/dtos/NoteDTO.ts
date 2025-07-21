/**
 * Application DTOs - Data Transfer Objects for Notes Management
 * These are used to transfer data between layers
 */

// Base Note DTO
export interface NoteDTO {
  id: number
  etudiantId: number
  matiereId: number
  teacherId: number
  noteCC: number | null
  noteTP: number | null
  noteDV: number | null
  noteFinale: number | null
  gradeLetter: string
  isPassed: boolean
  completionPercentage: number
}

// Student with their notes for a specific subject
export interface StudentNoteDTO {
  studentId: number
  studentFirstname: string
  studentLastname: string
  studentEmail: string
  studentNumero: string
  age: number
  note: NoteDTO | null
}

// Note configuration DTO
export interface NoteConfigDTO {
  id: number
  matiereId: number
  pourcentageCC: number
  pourcentageTP: number
  pourcentageDV: number
  hasTPComponent: boolean
  dominantComponent: 'CC' | 'TP' | 'DV' | 'balanced'
}

// Subject with note configuration
export interface SubjectWithConfigDTO {
  id: number
  nommatiere: string
  description: string | null
  coefficient: number
  noteConfig: NoteConfigDTO | null
}

// Request DTOs
export interface GetStudentNotesRequestDTO {
  matiereId: number
  classeId: number
}

export interface UpdateStudentNoteRequestDTO {
  etudiantId: number
  matiereId: number
  noteCC?: number | null
  noteTP?: number | null
  noteDV?: number | null
}

export interface BatchUpdateNotesRequestDTO {
  matiereId: number
  notes: UpdateStudentNoteRequestDTO[]
}

// Response DTOs
export interface GetStudentNotesResponseDTO {
  success: boolean
  error?: string
  data?: {
    subject: SubjectWithConfigDTO
    className: string
    students: StudentNoteDTO[]
    statistics: {
      totalStudents: number
      studentsWithNotes: number
      averageGrade: number | null
      passRate: number
      completionRate: number
    }
  }
}

export interface UpdateStudentNoteResponseDTO {
  success: boolean
  error?: string
  note?: NoteDTO
}

export interface BatchUpdateNotesResponseDTO {
  success: boolean
  error?: string
  results?: {
    successful: number
    failed: number
    errors: string[]
  }
}

// Teacher subjects DTO
export interface TeacherSubjectDTO {
  id: number
  matiereId: number
  classeId: number
  subjectName: string
  className: string
  bloc: string
  numClasse: number
  studentCount: number
  hasNotes: boolean
  completionRate: number
}

export interface GetTeacherSubjectsResponseDTO {
  success: boolean
  error?: string
  subjects?: TeacherSubjectDTO[]
} 