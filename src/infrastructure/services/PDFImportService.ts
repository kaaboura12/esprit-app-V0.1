import { readFile } from 'fs/promises'

export interface ScheduleEvent {
  time: string
  subject: string
  class: string
  room: string
}

export interface ScheduleDay {
  day: string
  date: string
  events: ScheduleEvent[]
}

export interface ExtractedSchedule {
  schedule: ScheduleDay[]
  totalEvents: number
  totalDays: number
}

/**
 * PDF Import Service - Infrastructure layer
 * This service extracts schedule data from PDF files
 */
export class PDFImportService {
  
  /**
   * Extract schedule data from a PDF file using the API endpoint
   */
  async extractScheduleFromPDF(file: File): Promise<ExtractedSchedule> {
    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append('pdf', file)

      // Call the API endpoint
      const response = await fetch('/api/schedule/import-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract schedule data')
      }

      return result.data
      
    } catch (error) {
      throw new Error(`Failed to extract schedule from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate PDF file
   */
  validatePDFFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'File must be a PDF document'
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      }
    }

    return { isValid: true }
  }
} 