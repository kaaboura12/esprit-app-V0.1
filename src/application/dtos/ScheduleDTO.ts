/**
 * Schedule DTO - Application layer
 * Data transfer object for schedule information
 */
export interface ScheduleDTO {
  id: number
  teacherId: number
  matiereId: number
  classeId: number
  scheduleDate: string // ISO date string
  weekStartDate: string // ISO date string
  startTime: string // Format: HH:MM
  endTime: string // Format: HH:MM
  sessionType: 'cours' | 'td' | 'tp' | 'exam'
  notes?: string
  isCancelled: boolean
  createdAt?: string // ISO date string
  updatedAt?: string // ISO date string
  // Additional display fields from joins
  teacherName?: string
  matiereNom?: string
  classeNom?: string
  classroom?: string
}

/**
 * Create Schedule DTO - Application layer
 * Data transfer object for creating a new schedule
 */
export interface CreateScheduleDTO {
  teacherId: number
  matiereId: number
  classeId: number
  scheduleDate: string // ISO date string
  weekStartDate: string // ISO date string
  startTime: string // Format: HH:MM
  endTime: string // Format: HH:MM
  sessionType: 'cours' | 'td' | 'tp' | 'exam'
  notes?: string
}

/**
 * Update Schedule DTO - Application layer
 * Data transfer object for updating an existing schedule
 */
export interface UpdateScheduleDTO {
  notes?: string
  isCancelled?: boolean
} 