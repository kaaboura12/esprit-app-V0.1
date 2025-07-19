import { ScheduleRepository } from "@/core/interfaces/ScheduleRepository"
import { Schedule } from "@/core/entities/Schedule"
import { ExtractedSchedule } from "@/infrastructure/services/PDFImportService"

/**
 * Import Schedules From PDF Use Case - Application layer
 * This use case handles importing schedule data extracted from PDF files
 */
export class ImportSchedulesFromPDFUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  /**
   * Import schedules from extracted PDF data
   */
  async execute(teacherId: number, extractedData: ExtractedSchedule): Promise<{
    success: boolean
    importedCount: number
    errors: string[]
    message: string
  }> {
    const errors: string[] = []
    let successCount = 0

    try {
      // Process each day in the extracted schedule
      for (const day of extractedData.schedule) {
        try {
          // Parse the date from the day object
          const dateStr = day.date
          if (!dateStr) {
            errors.push(`Missing date for day: ${day.day}`)
            continue
          }

          const scheduleDate = this.parseDate(dateStr)
          if (!scheduleDate) {
            errors.push(`Invalid date format: ${dateStr}`)
            continue
          }

          // Process each event for this day
          for (const event of day.events) {
            try {
              await this.processEvent(event, scheduleDate, teacherId)
              successCount++
            } catch (error) {
              errors.push(`Error processing event: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        } catch (error) {
          errors.push(`Error processing day ${day.day}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      return {
        success: successCount > 0,
        importedCount: successCount,
        errors,
        message: `Successfully imported ${successCount} schedule events${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      }

    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        message: 'Failed to import schedules'
      }
    }
  }

  /**
   * Process a single event and create a schedule
   */
  private async processEvent(event: any, scheduleDate: Date, teacherId: number): Promise<void> {
    // Normalize class and subject names
    const normalizedClasseName = this.normalizeClassName(event.class)
    const normalizedMatiereName = this.normalizeMatiereName(event.subject)

    // Look up class and subject IDs
    const classeId = await this.scheduleRepository.findClasseIdByName(normalizedClasseName)
    const matiereId = await this.scheduleRepository.findMatiereIdByName(normalizedMatiereName)

    if (!classeId) {
      throw new Error(`Class not found: ${normalizedClasseName}`)
    }

    if (!matiereId) {
      throw new Error(`Subject not found: ${normalizedMatiereName}`)
    }

    // Parse time slot
    const { startTime, endTime } = this.parseTimeSlot(event.time)

    // Calculate week start date (Monday of the week)
    const weekStartDate = this.getWeekStartDate(scheduleDate)

    // Create schedule entity
    const schedule = Schedule.create(
      0, // ID will be assigned by database
      teacherId,
      matiereId,
      classeId,
      scheduleDate,
      weekStartDate,
      startTime,
      endTime,
      'cours', // Default session type
      event.room ? `Salle: ${event.room}` : undefined
    )

    // Save to database
    await this.scheduleRepository.createSchedule(schedule)
  }

  /**
   * Parse date string to Date object - timezone safe
   */
  private parseDate(dateString: string): Date | null {
    try {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // 0-indexed
        const year = parseInt(parts[2], 10)
        
        // Create date at noon UTC to avoid timezone shifts
        return new Date(Date.UTC(year, month, day, 12, 0, 0, 0))
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Parse time slot (e.g., "08:00-10:00") to start and end times
   */
  private parseTimeSlot(timeSlot: string): { startTime: string; endTime: string } {
    const [start, end] = timeSlot.split('-')
    return {
      startTime: start.trim(),
      endTime: end.trim()
    }
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStartDate(date: Date): Date {
    const dayOfWeek = date.getUTCDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday = 0, Monday = 1
    const monday = new Date(date)
    monday.setUTCDate(date.getUTCDate() - daysToMonday)
    return new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate(), 12, 0, 0, 0))
  }

  /**
   * Normalize class name for database lookup
   */
  private normalizeClassName(classeName: string): string {
    return classeName
      .trim()
      .toUpperCase()
      .replace(/[\/\s]+$/, '') // Remove trailing slashes and spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
  }

  /**
   * Normalize subject name for database lookup
   */
  private normalizeMatiereName(matiereName: string): string {
    return matiereName
      .trim()
      .toUpperCase()
      .replace(/[\/\s]+$/, '') // Remove trailing slashes and spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
  }
} 