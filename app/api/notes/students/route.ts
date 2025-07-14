import { NextRequest, NextResponse } from 'next/server'
import { GetStudentNotesUseCase } from '@/application/use-cases/GetStudentNotesUseCase'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'
import { GetStudentNotesResponseDTO, GetStudentNotesRequestDTO } from '@/application/dtos/NoteDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * GET /api/notes/students?matiereId=1&classeId=2
 * Gets student notes for a specific subject and class
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      const response: GetStudentNotesResponseDTO = {
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
      const response: GetStudentNotesResponseDTO = {
        success: false,
        error: 'Invalid authentication token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const matiereIdParam = searchParams.get('matiereId')
    const classeIdParam = searchParams.get('classeId')

    if (!matiereIdParam || !classeIdParam) {
      const response: GetStudentNotesResponseDTO = {
        success: false,
        error: 'Subject ID and Class ID are required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const matiereId = parseInt(matiereIdParam)
    const classeId = parseInt(classeIdParam)

    if (isNaN(matiereId) || isNaN(classeId) || matiereId <= 0 || classeId <= 0) {
      const response: GetStudentNotesResponseDTO = {
        success: false,
        error: 'Invalid Subject ID or Class ID'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Create request DTO
    const requestDTO: GetStudentNotesRequestDTO = {
      matiereId,
      classeId
    }

    // Get student notes
    const notesRepository = new MySQLNotesRepository()
    const getStudentNotesUseCase = new GetStudentNotesUseCase(notesRepository)
    
    const result = await getStudentNotesUseCase.execute(requestDTO)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Get student notes API error:', error)
    
    const response: GetStudentNotesResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 