import { NextRequest, NextResponse } from 'next/server'
import { ImportSchedulesFromPDFUseCase } from '@/application/use-cases/ImportSchedulesFromPDFUseCase'
import { MySQLScheduleRepository } from '@/infrastructure/repositories/MySQLScheduleRepository'
import { authMiddleware } from '@/infrastructure/middleware/authMiddleware'
import { ExtractedSchedule } from '@/infrastructure/services/PDFImportService'

interface ImportSchedulesRequestDTO {
  extractedData: ExtractedSchedule
}

interface ImportSchedulesResponseDTO {
  success: boolean
  importedCount: number
  errors: string[]
  message: string
}

/**
 * POST /api/schedule/import-schedules
 * Handles importing schedule data from PDF extraction
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the request
    const authResult = await authMiddleware(request)
    
    if (!authResult.isAuthenticated || !authResult.teacher) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const teacherId = authResult.teacher.id

    // Parse request body
    const body: ImportSchedulesRequestDTO = await request.json()
    
    if (!body.extractedData) {
      return NextResponse.json(
        { success: false, error: 'Extracted data is required' },
        { status: 400 }
      )
    }

    // Initialize dependencies
    const scheduleRepository = new MySQLScheduleRepository()
    const importSchedulesUseCase = new ImportSchedulesFromPDFUseCase(scheduleRepository)

    // Execute the use case
    const result = await importSchedulesUseCase.execute(teacherId, body.extractedData)

    const response: ImportSchedulesResponseDTO = {
      success: result.success,
      importedCount: result.importedCount,
      errors: result.errors,
      message: result.message
    }

    return NextResponse.json(response, { status: result.success ? 200 : 400 })

  } catch (error) {
    console.error('Import schedules error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import schedules',
        importedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to import schedules'
      },
      { status: 500 }
    )
  }
} 