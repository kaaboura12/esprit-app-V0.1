/**
 * Application DTOs - Data Transfer Objects
 * These are used to transfer student data between layers
 */

export interface StudentDTO {
  id: number
  firstname: string
  lastname: string
  email: string
  classeId: number
  numeroEtudiant: string
  dateNaissance?: Date
}

export interface StudentResponseDTO {
  id: number
  firstname: string
  lastname: string
  email: string
  classeId: number
  numeroEtudiant: string
  dateNaissance?: Date
  fullName: string
  initials: string
  age: number
  isAdult: boolean
  academicYear: number
  generation: string
  status: 'active' | 'new' | 'senior'
  displayName: string
}

export interface StudentListResponseDTO {
  students: StudentResponseDTO[]
  total: number
  classeName?: string
}

export interface GetStudentsByClasseRequestDTO {
  classeId: number
} 