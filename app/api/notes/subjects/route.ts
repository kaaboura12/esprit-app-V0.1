import { NextRequest, NextResponse } from 'next/server'
import { GetTeacherSubjectsUseCase } from '@/application/use-cases/GetTeacherSubjectsUseCase'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'
import { GetTeacherSubjectsResponseDTO } from '@/application/dtos/NoteDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * GET /api/notes/subjects
 * Gets all subject assignments for the authenticated teacher for notes management
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      const response: GetTeacherSubjectsResponseDTO = {
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
      const response: GetTeacherSubjectsResponseDTO = {
        success: false,
        error: 'Invalid authentication token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get teacher's subject assignments
    const notesRepository = new MySQLNotesRepository()
    const getTeacherSubjectsUseCase = new GetTeacherSubjectsUseCase(notesRepository)
    
    const result = await getTeacherSubjectsUseCase.execute(teacherId)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Get teacher subjects API error:', error)
    
    const response: GetTeacherSubjectsResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 