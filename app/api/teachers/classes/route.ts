import { NextRequest, NextResponse } from 'next/server'
import { GetTeacherClassesUseCase } from '@/application/use-cases/GetTeacherClassesUseCase'
import { MySQLTeacherClassRepository } from '@/infrastructure/repositories/MySQLTeacherClassRepository'
import { GetTeacherClassesResponseDTO, TeacherClassAssignmentDTO } from '@/application/dtos/TeacherClassDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * GET /api/teachers/classes
 * Gets all class assignments for the authenticated teacher
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      const response: GetTeacherClassesResponseDTO = {
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
      const response: GetTeacherClassesResponseDTO = {
        success: false,
        error: 'Invalid authentication token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get teacher's class assignments
    const teacherClassRepository = new MySQLTeacherClassRepository()
    const getTeacherClassesUseCase = new GetTeacherClassesUseCase(teacherClassRepository)
    
    const assignments = await getTeacherClassesUseCase.execute(teacherId)
    
    // Convert to DTOs
    const classesDTO: TeacherClassAssignmentDTO[] = assignments.map(assignment => ({
      id: assignment.teacherClasse.getId(),
      teacherId: assignment.teacherClasse.getTeacherId(),
      classeId: assignment.teacherClasse.getClasseId(),
      matiereId: assignment.teacherClasse.getMatiereId(),
      className: assignment.classe.getNomClasse(),
      bloc: assignment.classe.getBloc(),
      numClasse: assignment.classe.getNumclasse(),
      maxStudents: assignment.classe.getNbreEtudiantMax(),
      currentStudents: assignment.classe.getNbreEtudiantActuel(),
      subjectName: assignment.matiere.getNommatiere(),
      subjectDescription: assignment.matiere.getDescription() || undefined,
      coefficient: assignment.matiere.getCoefficient(),
      capacityPercentage: assignment.classe.getCapacityPercentage(),
      status: assignment.classe.getStatus(),
      isNearlyFull: assignment.classe.isNearlyFull(),
      availableSpots: assignment.classe.getAvailableSpots()
    }))

    const response: GetTeacherClassesResponseDTO = {
      success: true,
      classes: classesDTO,
      message: `Found ${classesDTO.length} class assignments`
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Get teacher classes API error:', error)
    
    const response: GetTeacherClassesResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 