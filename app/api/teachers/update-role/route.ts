import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/infrastructure/middleware/authMiddleware'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { Teacher } from '@/core/entities/Teacher'

interface UpdateRoleRequestDTO {
  teacherId: number
  role: 'teacher' | 'admin'
}

interface UpdateRoleResponseDTO {
  success: boolean
  message?: string
  teacher?: {
    id: number
    firstname: string
    lastname: string
    email: string
    departement: string
    role: string
  }
}

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UpdateRoleRequestDTO = await request.json()
    const { teacherId, role } = body

    // Validate input
    if (!teacherId || !role) {
      const response: UpdateRoleResponseDTO = {
        success: false,
        message: 'Teacher ID and role are required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!['teacher', 'admin'].includes(role)) {
      const response: UpdateRoleResponseDTO = {
        success: false,
        message: 'Role must be either "teacher" or "admin"'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get teacher repository
    const teacherRepository = new MySQLTeacherRepository()

    // Find the teacher to update
    const existingTeacher = await teacherRepository.findById(teacherId)
    if (!existingTeacher) {
      const response: UpdateRoleResponseDTO = {
        success: false,
        message: 'Teacher not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Create updated teacher with new role
    const updatedTeacher = existingTeacher.withRole(role)

    // Save the updated teacher
    await teacherRepository.save(updatedTeacher)

    // Prepare response
    const response: UpdateRoleResponseDTO = {
      success: true,
      message: `Role updated successfully to ${role}`,
      teacher: {
        id: updatedTeacher.getId(),
        firstname: updatedTeacher.getFirstname(),
        lastname: updatedTeacher.getLastname(),
        email: updatedTeacher.getEmailValue(),
        departement: updatedTeacher.getDepartement(),
        role: updatedTeacher.getRole()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating teacher role:', error)
    const response: UpdateRoleResponseDTO = {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export const POST = withAdminAuth(handler) 