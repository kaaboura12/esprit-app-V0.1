import { NextRequest, NextResponse } from 'next/server'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { UpdateTeacherRequestDTO, TeacherDTO } from '@/application/dtos/TeacherDTO'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { setAuthCookie } from '@/infrastructure/middleware/authMiddleware'
import { Teacher } from '@/core/entities/Teacher'
import { Email } from '@/core/value-objects/Email'

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UpdateTeacherRequestDTO = await request.json()
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Teacher ID is required' }, { status: 400 })
    }

    const teacherRepository = new MySQLTeacherRepository()
    const existing = await teacherRepository.findById(body.id)
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 })
    }

    // Create a new Teacher instance with updated fields
    const updatedTeacher = new Teacher(
      existing.getId(),
      body.firstname ?? existing.getFirstname(),
      body.lastname ?? existing.getLastname(),
      new Email(body.email ?? existing.getEmailValue()),
      body.departement ?? existing.getDepartement(),
      existing.getHashedPassword(),
      body.photoUrl ?? existing.getPhotoUrl() ?? undefined
    )

    await teacherRepository.save(updatedTeacher)

    // Generate new JWT token
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const newAuthToken = await tokenService.generateToken(updatedTeacher)

    // Prepare response
    const response = {
      success: true,
      teacher: {
        id: updatedTeacher.getId(),
        firstname: updatedTeacher.getFirstname(),
        lastname: updatedTeacher.getLastname(),
        email: updatedTeacher.getEmailValue(),
        departement: updatedTeacher.getDepartement(),
        photoUrl: updatedTeacher.getPhotoUrl() || undefined
      } as TeacherDTO,
      token: newAuthToken.getToken(),
      message: 'Profile updated successfully'
    }

    // Set authentication cookie for browser requests
    const nextResponse = NextResponse.json(response, { status: 200 })
    setAuthCookie(nextResponse, newAuthToken.getToken(), newAuthToken.getExpiresAt())
    return nextResponse
  } catch (error) {
    console.error('Update teacher API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 