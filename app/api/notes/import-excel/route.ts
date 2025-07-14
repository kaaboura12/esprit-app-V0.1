import { NextRequest, NextResponse } from 'next/server'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'
import { ExcelNotesImportService } from '@/infrastructure/services/ExcelNotesImportService'
import { ImportNotesFromExcelUseCase } from '@/application/use-cases/ImportNotesFromExcelUseCase'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { ImportNotesFromExcelRequestDTO, ImportNotesFromExcelResponseDTO } from '@/application/dtos/ExcelNotesImportDTO'

/**
 * POST /api/notes/import-excel
 * Import notes from Excel file
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authToken = await tokenService.verifyToken(token)
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const matiereId = formData.get('matiereId') as string
    const classeId = formData.get('classeId') as string
    const overwriteExisting = formData.get('overwriteExisting') === 'true'

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Excel file is required' },
        { status: 400 }
      )
    }

    if (!matiereId || !classeId) {
      return NextResponse.json(
        { success: false, error: 'Subject ID and Class ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create request DTO
    const importRequest: ImportNotesFromExcelRequestDTO = {
      matiereId: parseInt(matiereId),
      classeId: parseInt(classeId),
      overwriteExisting
    }

    // Initialize services and use case
    const notesRepository = new MySQLNotesRepository()
    const excelImportService = new ExcelNotesImportService()
    const importNotesUseCase = new ImportNotesFromExcelUseCase(notesRepository, excelImportService)

    // Execute import
    const result = await importNotesUseCase.execute(
      buffer,
      importRequest,
      authToken.getTeacherId()
    )

    // Return response
    const response: ImportNotesFromExcelResponseDTO = {
      success: result.success,
      error: result.error,
      message: result.message,
      results: result.results
    }

    return NextResponse.json(response, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('Excel notes import error:', error)
    
    const response: ImportNotesFromExcelResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error occurred during import'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * GET /api/notes/import-excel/template
 * Generate Excel template for notes import
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authToken = await tokenService.verifyToken(token)
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const matiereId = searchParams.get('matiereId')
    const classeId = searchParams.get('classeId')
    const includeExistingNotes = searchParams.get('includeExistingNotes') === 'true'
    const includeStudentEmails = searchParams.get('includeStudentEmails') === 'true'

    // Validate required parameters
    if (!matiereId || !classeId) {
      return NextResponse.json(
        { success: false, error: 'Subject ID and Class ID are required' },
        { status: 400 }
      )
    }

    // Initialize services and use case
    const notesRepository = new MySQLNotesRepository()
    const excelImportService = new ExcelNotesImportService()
    const importNotesUseCase = new ImportNotesFromExcelUseCase(notesRepository, excelImportService)

    // Generate template
    const result = await importNotesUseCase.generateTemplate({
      matiereId: parseInt(matiereId),
      classeId: parseInt(classeId),
      includeExistingNotes,
      includeStudentEmails
    })

    if (!result.success || !result.templateData) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate template' },
        { status: 400 }
      )
    }

    // Create Excel file using a simple CSV format for now
    // In a real implementation, you might want to use a proper Excel library
    const headers = result.templateData.headers
    const students = result.templateData.students

    let csvContent = headers.join(',') + '\n'
    
    // Add student data
    students.forEach(student => {
      const row = headers.map(header => {
        const value = student[header as keyof typeof student]
        return value !== undefined && value !== null ? String(value) : ''
      })
      csvContent += row.join(',') + '\n'
    })

    // Return CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${result.templateData.filename.replace('.xlsx', '.csv')}"`,
        'Cache-Control': 'no-cache'
      }
    })

    return response

  } catch (error) {
    console.error('Template generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error occurred during template generation' 
      },
      { status: 500 }
    )
  }
} 