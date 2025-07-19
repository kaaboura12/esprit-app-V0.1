import { ScheduleRepository } from "../../core/interfaces/ScheduleRepository"
import { Schedule } from "../../core/entities/Schedule"
import { ScheduleDTO } from "../dtos/ScheduleDTO"

/**
 * Get Schedules Use Case - Application layer
 * This use case handles retrieving schedules and converting them to DTOs
 */
export class GetSchedulesUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  /**
   * Get schedules for a specific week
   */
  async getSchedulesByWeek(weekStartDate: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByWeek(weekStartDate)
    return schedules.map(schedule => this.convertToDTO(schedule))
  }

  /**
   * Get schedules for a specific date
   */
  async getSchedulesByDate(date: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByDate(date)
    return schedules.map(schedule => this.convertToDTO(schedule))
  }

  /**
   * Get schedules for a specific teacher
   */
  async getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByTeacher(teacherId, startDate, endDate)
    return schedules.map(schedule => this.convertToDTO(schedule))
  }

  /**
   * Get schedules for a specific class
   */
  async getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByClass(classeId, startDate, endDate)
    return schedules.map(schedule => this.convertToDTO(schedule))
  }

  /**
   * Get schedules for a specific subject
   */
  async getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesBySubject(matiereId, startDate, endDate)
    return schedules.map(schedule => this.convertToDTO(schedule))
  }

  /**
   * Get a specific schedule by ID
   */
  async getScheduleById(id: number): Promise<ScheduleDTO | null> {
    const schedule = await this.scheduleRepository.getScheduleById(id)
    if (!schedule) {
      return null
    }
    return this.convertToDTO(schedule)
  }

  /**
   * Get schedule statistics
   */
  async getScheduleStats(startDate?: Date, endDate?: Date, teacherId?: number) {
    return await this.scheduleRepository.getScheduleStats(startDate, endDate, teacherId)
  }

  /**
   * Convert Schedule entity to ScheduleDTO
   */
  private convertToDTO(schedule: Schedule): ScheduleDTO {
    return {
      id: schedule.getId(),
      teacherId: schedule.getTeacherId(),
      matiereId: schedule.getMatiereId(),
      classeId: schedule.getClasseId(),
      scheduleDate: schedule.getScheduleDate().toISOString().split('T')[0], // Format as YYYY-MM-DD
      weekStartDate: schedule.getWeekStartDate().toISOString().split('T')[0], // Format as YYYY-MM-DD
      startTime: schedule.getStartTime(),
      endTime: schedule.getEndTime(),
      sessionType: schedule.getSessionType() as 'cours' | 'td' | 'tp' | 'exam',
      notes: schedule.getNotes(),
      isCancelled: schedule.getIsCancelled(),
      createdAt: schedule.getCreatedAt()?.toISOString().split('T')[0],
      updatedAt: schedule.getUpdatedAt()?.toISOString().split('T')[0],
      // Additional display fields from joins (if available)
      teacherName: (schedule as any).teacherName,
      matiereNom: (schedule as any).matiereNom,
      classeNom: (schedule as any).classeNom,
      classroom: (schedule as any).classroom
    }
  }

  /**
   * Convert ScheduleDTO to FullCalendar event format
   */
  static toCalendarEvent(schedule: ScheduleDTO): any {
    // Create date strings directly to avoid timezone issues
    const startDateTime = `${schedule.scheduleDate}T${schedule.startTime}`
    const endDateTime = `${schedule.scheduleDate}T${schedule.endTime}`
    
    return {
      id: schedule.id.toString(),
      title: `${schedule.matiereNom || 'Unknown Subject'} - ${schedule.sessionType.toUpperCase()}`,
      start: startDateTime,
      end: endDateTime,
      extendedProps: {
        teacherName: schedule.teacherName,
        classeNom: schedule.classeNom,
        classroom: schedule.classroom,
        notes: schedule.notes,
        isCancelled: schedule.isCancelled,
        sessionType: schedule.sessionType
      },
      backgroundColor: schedule.isCancelled ? '#ff6b6b' : 
                      schedule.sessionType === 'cours' ? '#4ecdc4' :
                      schedule.sessionType === 'td' ? '#45b7d1' :
                      schedule.sessionType === 'tp' ? '#96ceb4' : '#feca57',
      borderColor: schedule.isCancelled ? '#ff5252' : 
                   schedule.sessionType === 'cours' ? '#26a69a' :
                   schedule.sessionType === 'td' ? '#1976d2' :
                   schedule.sessionType === 'tp' ? '#66bb6a' : '#ff9800'
    }
  }
} 