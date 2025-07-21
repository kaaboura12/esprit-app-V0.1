/**
 * Domain Entity - Schedule
 * Represents a scheduled class session with business rules
 */
export class Schedule {
  constructor(
    private readonly id: number,
    private readonly teacherId: number,
    private readonly matiereId: number,
    private readonly classeId: number,
    private readonly scheduleDate: Date,
    private readonly weekStartDate: Date,
    private readonly startTime: string, // Format: HH:MM
    private readonly endTime: string, // Format: HH:MM
    private readonly sessionType: 'cours' | 'td' | 'tp' | 'exam' = 'cours',
    private readonly notes?: string,
    private readonly isCancelled: boolean = false,
    private readonly createdAt?: Date,
    private readonly updatedAt?: Date
  ) {
    // Validate time order
    this.validateTimeOrder()
    
    // Note: We don't validate schedule date here to allow past schedules for viewing
  }

  getId(): number {
    return this.id
  }

  getTeacherId(): number {
    return this.teacherId
  }

  getMatiereId(): number {
    return this.matiereId
  }

  getClasseId(): number {
    return this.classeId
  }

  getScheduleDate(): Date {
    return this.scheduleDate
  }

  getWeekStartDate(): Date {
    return this.weekStartDate
  }

  getStartTime(): string {
    return this.startTime
  }

  getEndTime(): string {
    return this.endTime
  }

  getSessionType(): string {
    return this.sessionType
  }

  getNotes(): string | undefined {
    return this.notes
  }

  getIsCancelled(): boolean {
    return this.isCancelled
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt
  }

  /**
   * Get formatted time slot (e.g., "08:00-10:00")
   */
  getTimeSlot(): string {
    return `${this.startTime}-${this.endTime}`
  }

  /**
   * Get duration in minutes
   */
  getDurationInMinutes(): number {
    const [startHour, startMin] = this.startTime.split(':').map(Number)
    const [endHour, endMin] = this.endTime.split(':').map(Number)
    
    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin
    
    return endTotalMin - startTotalMin
  }

  /**
   * Check if schedule is active (not cancelled and not in the past)
   */
  isActive(): boolean {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const scheduleDay = new Date(this.scheduleDate.getFullYear(), this.scheduleDate.getMonth(), this.scheduleDate.getDate())
    
    return !this.isCancelled && scheduleDay >= today
  }

  /**
   * Check if schedule is for today
   */
  isToday(): boolean {
    const today = new Date()
    return this.scheduleDate.toDateString() === today.toDateString()
  }

  /**
   * Check if schedule is for this week
   */
  isThisWeek(): boolean {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    
    return this.weekStartDate.toDateString() === startOfWeek.toDateString()
  }

  /**
   * Check if two schedules overlap in time
   */
  overlapsWith(other: Schedule): boolean {
    if (this.scheduleDate.toDateString() !== other.scheduleDate.toDateString()) {
      return false
    }

    const thisStart = this.timeToMinutes(this.startTime)
    const thisEnd = this.timeToMinutes(this.endTime)
    const otherStart = this.timeToMinutes(other.startTime)
    const otherEnd = this.timeToMinutes(other.endTime)

    return thisStart < otherEnd && thisEnd > otherStart
  }

  /**
   * Create a cancelled version of this schedule
   */
  cancel(): Schedule {
    return new Schedule(
      this.id,
      this.teacherId,
      this.matiereId,
      this.classeId,
      this.scheduleDate,
      this.weekStartDate,
      this.startTime,
      this.endTime,
      this.sessionType,
      this.notes,
      true, // isCancelled = true
      this.createdAt,
      new Date() // updatedAt = now
    )
  }

  /**
   * Business rule: End time must be after start time
   */
  private validateTimeOrder(): void {
    const startMinutes = this.timeToMinutes(this.startTime)
    const endMinutes = this.timeToMinutes(this.endTime)
    
    if (endMinutes <= startMinutes) {
      throw new Error('End time must be after start time')
    }
  }

  /**
   * Business rule: Cannot schedule classes in the past (for new schedule creation only)
   * This method should be called when creating NEW schedules, not when loading existing ones
   */
  static validateNewScheduleDate(scheduleDate: Date): void {
    const today = new Date()
    const scheduleDay = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Allow scheduling for today and future dates
    if (scheduleDay < todayDay) {
      throw new Error('Cannot schedule classes in the past')
    }
  }

  /**
   * Check if schedule is in the past
   */
  isInPast(): boolean {
    const today = new Date()
    const scheduleDay = new Date(this.scheduleDate.getFullYear(), this.scheduleDate.getMonth(), this.scheduleDate.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    return scheduleDay < todayDay
  }

  /**
   * Helper method to convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * Static factory method to create a Schedule
   */
  static create(
    id: number,
    teacherId: number,
    matiereId: number,
    classeId: number,
    scheduleDate: Date,
    weekStartDate: Date,
    startTime: string,
    endTime: string,
    sessionType: 'cours' | 'td' | 'tp' | 'exam' = 'cours',
    notes?: string,
    isCancelled: boolean = false,
    createdAt?: Date,
    updatedAt?: Date
  ): Schedule {
    return new Schedule(
      id,
      teacherId,
      matiereId,
      classeId,
      scheduleDate,
      weekStartDate,
      startTime,
      endTime,
      sessionType,
      notes,
      isCancelled,
      createdAt,
      updatedAt
    )
  }
} 