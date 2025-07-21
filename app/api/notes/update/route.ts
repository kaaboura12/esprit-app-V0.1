import { NextRequest, NextResponse } from 'next/server'
import { UpdateStudentNotesUseCase } from '@/application/use-cases/UpdateStudentNotesUseCase'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'
import { 
  UpdateStudentNoteRequestDTO, 
  UpdateStudentNoteResponseDTO,
  BatchUpdateNotesRequestDTO,
  BatchUpdateNotesResponseDTO 
} from '@/application/dtos/NoteDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * PUT /api/notes/update
 * Updates student notes (single note)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      const response: UpdateStudentNoteResponseDTO = {
        success: false,
        error: 'Authentication required'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Validate token and get teacher ID
    const tokenService = JwtTokenServiceSingleton.getInstance()
    let teacherId: number
    
    try {
      const authToken = await tokenService.verifyToken(token)
      
      if (!authToken || !authToken.isValid()) {
        throw new Error('Invalid or expired token')
      }
      
      teacherId = authToken.getTeacherId()
      
      if (!teacherId || teacherId <= 0) {
        throw new Error('Invalid teacher ID in token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      const response: UpdateStudentNoteResponseDTO = {
        success: false,
        error: 'Invalid authentication token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Parse request body
    const body: UpdateStudentNoteRequestDTO = await request.json()
    
    if (!body.etudiantId || !body.matiereId) {
      const response: UpdateStudentNoteResponseDTO = {
        success: false,
        error: 'Student ID and Subject ID are required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Update student note
    const notesRepository = new MySQLNotesRepository()
    const updateStudentNotesUseCase = new UpdateStudentNotesUseCase(notesRepository)
    
    const result = await updateStudentNotesUseCase.updateSingleNote(body, teacherId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Update student note API error:', error)
    
    const response: UpdateStudentNoteResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/notes/update
 * Batch updates student notes
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      const response: BatchUpdateNotesResponseDTO = {
        success: false,
        error: 'Authentication required'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Validate token and get teacher ID
    const tokenService = JwtTokenServiceSingleton.getInstance()
    let teacherId: number
    
    try {
      const authToken = await tokenService.verifyToken(token)
      
      if (!authToken || !authToken.isValid()) {
        throw new Error('Invalid or expired token')
      }
      
      teacherId = authToken.getTeacherId()
      
      if (!teacherId || teacherId <= 0) {
        throw new Error('Invalid teacher ID in token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      const response: BatchUpdateNotesResponseDTO = {
        success: false,
        error: 'Invalid authentication token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Parse request body
    const body: BatchUpdateNotesRequestDTO = await request.json()
    
    if (!body.matiereId || !body.notes || !Array.isArray(body.notes)) {
      const response: BatchUpdateNotesResponseDTO = {
        success: false,
        error: 'Subject ID and notes array are required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Batch update student notes
    const notesRepository = new MySQLNotesRepository()
    const updateStudentNotesUseCase = new UpdateStudentNotesUseCase(notesRepository)
    
    const result = await updateStudentNotesUseCase.batchUpdateNotes(body, teacherId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Batch update notes API error:', error)
    
    const response: BatchUpdateNotesResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 