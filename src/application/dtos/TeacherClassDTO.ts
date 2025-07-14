/**
 * DTO for teacher class assignment data
 */
export interface TeacherClassAssignmentDTO {
  id: number
  teacherId: number
  classeId: number
  matiereId: number
  className: string
  bloc: string
  numClasse: number
  maxStudents: number
  currentStudents: number
  subjectName: string
  subjectDescription?: string
  coefficient: number
  capacityPercentage: number
  status: 'empty' | 'low' | 'medium' | 'high' | 'full'
  isNearlyFull: boolean
  availableSpots: number
}

/**
 * Response DTO for teacher classes API
 */
export interface GetTeacherClassesResponseDTO {
  success: boolean
  classes?: TeacherClassAssignmentDTO[]
  error?: string
  message?: string
}

/**
 * Request DTO for teacher classes API
 */
export interface GetTeacherClassesRequestDTO {
  teacherId: number
} 