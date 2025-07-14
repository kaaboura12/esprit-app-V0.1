import { ScheduleRepository } from '../../core/interfaces/ScheduleRepository'
import { Schedule } from '../../core/entities/Schedule'
import { ScheduleDTO } from '../dtos/ScheduleDTO'

export class GetSchedulesUseCase {
  constructor(
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  /**
   * Get schedules for a specific week
   */
  async getSchedulesByWeek(weekStartDate: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByWeek(weekStartDate)
    return schedules.map(this.mapToDTO)
  }

  /**
   * Get schedules for a specific date
   */
  async getSchedulesByDate(date: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByDate(date)
    return schedules.map(this.mapToDTO)
  }

  /**
   * Get schedules for a teacher
   */
  async getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByTeacher(teacherId, startDate, endDate)
    return schedules.map(this.mapToDTO)
  }

  /**
   * Get schedules for a class
   */
  async getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesByClass(classeId, startDate, endDate)
    return schedules.map(this.mapToDTO)
  }

  /**
   * Get schedules for a subject
   */
  async getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.getSchedulesBySubject(matiereId, startDate, endDate)
    return schedules.map(this.mapToDTO)
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: number): Promise<ScheduleDTO | null> {
    const schedule = await this.scheduleRepository.getScheduleById(id)
    return schedule ? this.mapToDTO(schedule) : null
  }

  /**
   * Get schedule statistics
   */
  async getScheduleStats(startDate?: Date, endDate?: Date, teacherId?: number) {
    return await this.scheduleRepository.getScheduleStats(startDate, endDate, teacherId)
  }

  /**
   * Convert Schedule entity to DTO
   */
  private mapToDTO(schedule: Schedule): ScheduleDTO {
    return {
      id: schedule.getId(),
      teacherId: schedule.getTeacherId(),
      matiereId: schedule.getMatiereId(),
      classeId: schedule.getClasseId(),
      dayOfWeek: schedule.getDayOfWeek() as 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche',
      scheduleDate: schedule.getScheduleDate().toISOString(),
      weekStartDate: schedule.getWeekStartDate().toISOString(),
      startTime: schedule.getStartTime(),
      endTime: schedule.getEndTime(),
      sessionType: schedule.getSessionType() as 'cours' | 'td' | 'tp' | 'exam',
      notes: schedule.getNotes(),
      isCancelled: schedule.getIsCancelled(),
      createdAt: schedule.getCreatedAt()?.toISOString(),
      updatedAt: schedule.getUpdatedAt()?.toISOString(),
      // These will be populated by the repository query joins
      teacherName: (schedule as any).teacherName,
      matiereNom: (schedule as any).matiereNom,
      classeNom: (schedule as any).classeNom,
      classroom: (schedule as any).classroom
    }
  }

  /**
   * Convert ScheduleDTO to FullCalendar event format
   */
  static toCalendarEvent(schedule: ScheduleDTO): {
    id: string
    title: string
    start: string
    end: string
    backgroundColor: string
    borderColor: string
    textColor: string
    extendedProps: {
      teacher: string
      classroom: string
      students: number
      department: string
      type: string
      description?: string
      classeNom: string
    }
  } {
    // Handle date properly - use local date instead of UTC
    const scheduleDate = new Date(schedule.scheduleDate)
    const year = scheduleDate.getFullYear()
    const month = String(scheduleDate.getMonth() + 1).padStart(2, '0')
    const day = String(scheduleDate.getDate()).padStart(2, '0')
    const date = `${year}-${month}-${day}`
    
    // Color mapping based on session type
    const colors = {
      cours: { bg: '#ef4444', border: '#dc2626' },
      td: { bg: '#1f2937', border: '#111827' },
      tp: { bg: '#059669', border: '#047857' },
      exam: { bg: '#dc2626', border: '#b91c1c' }
    }
    
    const color = colors[schedule.sessionType] || colors.cours
    
    // Create a more informative title that includes class and classroom
    const matiereName = schedule.matiereNom || `Matière ${schedule.matiereId}`
    const classeName = schedule.classeNom || `Classe ${schedule.classeId}`
    const classroom = schedule.classroom || 'Salle non définie'
    
    // Format the title to show: Subject - Class (Classroom)
    const title = `${matiereName} - ${classeName} (${classroom})`
    
    const event = {
      id: schedule.id.toString(),
      title: title,
      start: `${date}T${schedule.startTime}`,
      end: `${date}T${schedule.endTime}`,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: '#ffffff',
      extendedProps: {
        teacher: schedule.teacherName || `Enseignant ${schedule.teacherId}`,
        classroom: classroom,
        students: 0, // This would need to be fetched from class info
        department: 'Département', // This would need to be fetched from teacher/subject info
        type: schedule.sessionType,
        description: schedule.notes,
        classeNom: classeName
      }
    }
    
    return event
  }
} 