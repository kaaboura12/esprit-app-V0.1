export interface ScheduleDTO {
  id: number
  teacherId: number
  matiereId: number
  classeId: number
  dayOfWeek: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'
  scheduleDate: string // ISO date string
  weekStartDate: string // ISO date string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  sessionType: 'cours' | 'td' | 'tp' | 'exam'
  notes?: string
  isCancelled: boolean
  createdAt?: string // ISO date string
  updatedAt?: string // ISO date string
  
  // Related data for display
  teacherName?: string
  matiereNom?: string
  classeNom?: string
  classroom?: string
}

export interface CreateScheduleDTO {
  teacherId: number
  matiereId: number
  classeId: number
  dayOfWeek: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'
  scheduleDate: string
  weekStartDate: string
  startTime: string
  endTime: string
  sessionType: 'cours' | 'td' | 'tp' | 'exam'
  notes?: string
}

export interface UpdateScheduleDTO {
  id: number
  teacherId?: number
  matiereId?: number
  classeId?: number
  dayOfWeek?: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'
  scheduleDate?: string
  weekStartDate?: string
  startTime?: string
  endTime?: string
  sessionType?: 'cours' | 'td' | 'tp' | 'exam'
  notes?: string
  isCancelled?: boolean
} 