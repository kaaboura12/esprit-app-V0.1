import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/infrastructure/middleware/authMiddleware'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { MySQLAuthRepository } from '@/infrastructure/repositories/MySQLAuthRepository'
import { TeacherResponseDTO, TeacherListResponseDTO } from '@/application/dtos/TeacherDTO'
import { Teacher } from '@/core/entities/Teacher'
import { Email } from '@/core/value-objects/Email'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const teacherRepository = new MySQLTeacherRepository()
    const teachers = await teacherRepository.findAll()

    const teacherDTOs: TeacherResponseDTO[] = teachers.map(teacher => ({
      id: teacher.getId(),
      firstname: teacher.getFirstname(),
      lastname: teacher.getLastname(),
      email: teacher.getEmailValue(),
      departement: teacher.getDepartement(),
      fullName: teacher.getFullName(),
      hasProfilePhoto: teacher.hasProfilePhoto(),
      photoUrl: teacher.getPhotoUrl() || undefined,
      role: teacher.getRole()
    }))

    const response: TeacherListResponseDTO = {
      teachers: teacherDTOs,
      total: teacherDTOs.length
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { firstname, lastname, email, departement, password, role = 'teacher' } = body

    // Validate required fields
    if (!firstname || !lastname || !email || !departement || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !['teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "teacher" or "admin"' },
        { status: 400 }
      )
    }

    const authRepository = new MySQLAuthRepository()
    
    // Create teacher with proper password hashing
    const teacher = await authRepository.createTeacher(
      firstname,
      lastname,
      email,
      departement,
      password,
      role
    )

    return NextResponse.json(
      { 
        message: 'Teacher created successfully',
        teacher: {
          id: teacher.getId(),
          firstname: teacher.getFirstname(),
          lastname: teacher.getLastname(),
          email: teacher.getEmailValue(),
          departement: teacher.getDepartement(),
          role: teacher.getRole()
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create teacher' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler) 