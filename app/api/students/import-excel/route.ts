import { NextRequest, NextResponse } from 'next/server'
import { ImportStudentsFromExcelUseCase } from '@/application/use-cases/ImportStudentsFromExcelUseCase'
import { MySQLStudentRepository } from '@/infrastructure/repositories/MySQLStudentRepository'
import { ExcelImportService } from '@/infrastructure/services/ExcelImportService'

/**
 * POST /api/students/import-excel
 * Handles Excel file import for students
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const classeId = formData.get('classeId') as string
    const overwriteExisting = formData.get('overwriteExisting') === 'true'

    // Validate input
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided',
        errors: ['Excel file is required']
      }, { status: 400 })
    }

    if (!classeId || isNaN(parseInt(classeId))) {
      return NextResponse.json({
        success: false,
        message: 'Invalid class ID',
        errors: ['Valid class ID is required']
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // Sometimes Excel files come as this
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type',
        errors: ['Only Excel files (.xlsx, .xls) are allowed']
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'File too large',
        errors: ['File size must be less than 10MB']
      }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Initialize dependencies
    const studentRepository = new MySQLStudentRepository()
    const excelImportService = new ExcelImportService()
    const importUseCase = new ImportStudentsFromExcelUseCase(
      studentRepository,
      excelImportService
    )

    // Validate request
    const requestValidation = importUseCase.validateRequest({
      fileBuffer: buffer,
      defaultClasseId: parseInt(classeId),
      overwriteExisting
    })

    if (!requestValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request',
        errors: requestValidation.errors
      }, { status: 400 })
    }

    // Execute import
    const result = await importUseCase.execute({
      fileBuffer: buffer,
      defaultClasseId: parseInt(classeId),
      overwriteExisting
    })

    // Return response
    const statusCode = result.success ? 200 : 400
    return NextResponse.json(result, { status: statusCode })

  } catch (error) {
    console.error('Excel import API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      results: {
        totalRows: 0,
        validRows: 0,
        successfulImports: 0,
        failedImports: 0,
        skippedDuplicates: 0
      },
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: [],
      importedStudents: []
    }, { status: 500 })
  }
}

/**
 * GET /api/students/import-excel
 * Returns information about the Excel import format
 */
export async function GET(): Promise<NextResponse> {
  const importInfo = {
    supportedFormats: ['.xlsx', '.xls'],
    maxFileSize: '10MB',
    maxRows: 1000,
    requiredColumns: [
      {
        name: 'prenom',
        description: 'Student first name',
        required: true,
        example: 'Ahmed'
      },
      {
        name: 'nom',
        description: 'Student last name',
        required: true,
        example: 'Ben Ali'
      },
      {
        name: 'email',
        description: 'Student email address',
        required: true,
        example: 'ahmed.benali@esprit.tn'
      },
      {
        name: 'numeroetudiant',
        description: 'Student number',
        required: true,
        example: '2021001234'
      }
    ],
    optionalColumns: [
      {
        name: 'datenaissance',
        description: 'Birth date (DD/MM/YYYY or YYYY-MM-DD)',
        required: false,
        example: '15/03/2001'
      }
    ],
    notes: [
      'Column headers must match exactly (case-insensitive)',
      'Email addresses must be valid format',
      'Student numbers must follow the format: YYYY + 6 digits',
      'Birth dates can be in various formats',
      'Duplicate emails or student numbers will be skipped unless overwrite is enabled',
      'All students will be assigned to the specified class'
    ]
  }

  return NextResponse.json({
    success: true,
    data: importInfo
  })
} 