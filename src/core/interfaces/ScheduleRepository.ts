import { Schedule } from '../entities/Schedule'

export interface ScheduleRepository {
  /**
   * Get all schedules for a specific week
   */
  getSchedulesByWeek(weekStartDate: Date): Promise<Schedule[]>
  
  /**
   * Get all schedules for a specific date
   */
  getSchedulesByDate(date: Date): Promise<Schedule[]>
  
  /**
   * Get schedules for a specific teacher
   */
  getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]>
  
  /**
   * Get schedules for a specific class
   */
  getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]>
  
  /**
   * Get schedules for a specific subject
   */
  getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]>
  
  /**
   * Get a schedule by ID
   */
  getScheduleById(id: number): Promise<Schedule | null>
  
  /**
   * Create a new schedule
   */
  createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule>
  
  /**
   * Update an existing schedule
   */
  updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule>
  
  /**
   * Delete a schedule
   */
  deleteSchedule(id: number): Promise<void>
  
  /**
   * Cancel a schedule (soft delete)
   */
  cancelSchedule(id: number): Promise<Schedule>
  
  /**
   * Check for schedule conflicts
   */
  checkConflicts(schedule: Schedule): Promise<Schedule[]>
  
  /**
   * Get schedule statistics
   */
  getScheduleStats(startDate?: Date, endDate?: Date, teacherId?: number): Promise<{
    totalSchedules: number
    activeSchedules: number
    cancelledSchedules: number
    courseCount: number
    examCount: number
    tdCount: number
    tpCount: number
  }>

  /**
   * Find class ID by class name
   */
  findClasseIdByName(nomClasse: string): Promise<number | null>

  /**
   * Find subject ID by subject name
   */
  findMatiereIdByName(nomMatiere: string): Promise<number | null>
} 