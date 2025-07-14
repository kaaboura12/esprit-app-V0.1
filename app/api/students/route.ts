import { NextRequest, NextResponse } from 'next/server'
import { GetStudentsByClasseUseCase } from '@/application/use-cases/GetStudentsByClasseUseCase'
import { AddStudentUseCase } from '@/application/use-cases/AddStudentUseCase'
import { MySQLStudentRepository } from '@/infrastructure/repositories/MySQLStudentRepository'
import { StudentListResponseDTO, StudentResponseDTO } from '@/application/dtos/StudentDTO'

/**
 * GET /api/students?classeId=123
 * Retrieves students by class ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const classeId = searchParams.get('classeId')

    if (!classeId || isNaN(Number(classeId))) {
      return NextResponse.json(
        { error: 'Valid classeId parameter is required' },
        { status: 400 }
      )
    }

    // Initialize dependencies
    const studentRepository = new MySQLStudentRepository()
    const getStudentsByClasseUseCase = new GetStudentsByClasseUseCase(studentRepository)

    // Execute use case
    const students = await getStudentsByClasseUseCase.execute(Number(classeId))

    // Transform entities to DTOs
    const studentDTOs: StudentResponseDTO[] = students.map(student => ({
      id: student.getId(),
      firstname: student.getFirstname(),
      lastname: student.getLastname(),
      email: student.getEmailValue(),
      classeId: student.getClasseId(),
      numeroEtudiant: student.getNumeroEtudiantValue(),
      dateNaissance: student.getDateNaissance() || undefined,
      fullName: student.getFullName(),
      initials: student.getInitials(),
      age: student.getAge(),
      isAdult: student.isAdult(),
      academicYear: student.getAcademicYear(),
      generation: student.getGeneration(),
      status: student.getStatus(),
      displayName: student.getDisplayName()
    }))

    const response: StudentListResponseDTO = {
      students: studentDTOs,
      total: studentDTOs.length,
      classeName: classeId // We could enhance this to get actual class name
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Students API error:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/students
 * Creates a new student
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstname || !body.lastname || !body.email || !body.numeroEtudiant || !body.classeId) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Initialize dependencies
    const studentRepository = new MySQLStudentRepository()
    const addStudentUseCase = new AddStudentUseCase(studentRepository)

    // Prepare request data
    const addStudentRequest = {
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      numeroEtudiant: body.numeroEtudiant,
      classeId: parseInt(body.classeId),
      dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : undefined
    }

    // Execute use case
    const result = await addStudentUseCase.execute(addStudentRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Transform entity to DTO
    const studentDTO: StudentResponseDTO = {
      id: result.student!.getId(),
      firstname: result.student!.getFirstname(),
      lastname: result.student!.getLastname(),
      email: result.student!.getEmailValue(),
      classeId: result.student!.getClasseId(),
      numeroEtudiant: result.student!.getNumeroEtudiantValue(),
      dateNaissance: result.student!.getDateNaissance() || undefined,
      fullName: result.student!.getFullName(),
      initials: result.student!.getInitials(),
      age: result.student!.getAge(),
      isAdult: result.student!.isAdult(),
      academicYear: result.student!.getAcademicYear(),
      generation: result.student!.getGeneration(),
      status: result.student!.getStatus(),
      displayName: result.student!.getDisplayName()
    }

    return NextResponse.json(
      { 
        success: true, 
        student: studentDTO,
        message: 'Étudiant créé avec succès'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create student API error:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 