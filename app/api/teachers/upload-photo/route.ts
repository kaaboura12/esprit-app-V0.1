import { NextRequest, NextResponse } from 'next/server'
import { UpdateTeacherPhotoUseCase } from '@/application/use-cases/UpdateTeacherPhotoUseCase'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { UpdatePhotoRequestDTO, UpdatePhotoResponseDTO } from '@/application/dtos/TeacherDTO'
import { writeFile, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { setAuthCookie } from '@/infrastructure/middleware/authMiddleware'

/**
 * POST /api/teachers/upload-photo
 * Handles teacher profile photo uploads
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const teacherId = formData.get('teacherId') as string

    // Validate input
    if (!file) {
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'No file provided'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!teacherId) {
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'Teacher ID is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Create upload directory structure with better error handling
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'teachers')
    
    try {
      // Always ensure directory exists (in case it was deleted)
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      // Verify directory is writable
      await access(uploadDir, 2) // 2 = write permission
    } catch (dirError) {
      console.error('Error creating or accessing upload directory:', dirError)
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'Server configuration error: Unable to create upload directory'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Generate unique filename with better naming
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `teacher_${teacherId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    try {
      // Save file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      
      // Verify file was actually written
      if (!existsSync(filePath)) {
        throw new Error('File was not written to disk')
      }
      
    } catch (writeError) {
      console.error('Error writing file:', writeError)
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'Failed to save uploaded file'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Create photo URL
    const photoUrl = `/uploads/teachers/${fileName}`

    // Update teacher photo in database
    const teacherRepository = new MySQLTeacherRepository()
    const updatePhotoUseCase = new UpdateTeacherPhotoUseCase(teacherRepository)

    const updateRequest: UpdatePhotoRequestDTO = {
      teacherId: parseInt(teacherId),
      photoUrl: photoUrl
    }

    const result = await updatePhotoUseCase.execute(updateRequest)

    if (!result.success) {
      console.error('Database update failed:', result.message)
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: result.message || 'Failed to update teacher photo'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Get updated teacher data to regenerate JWT token
    const updatedTeacher = await teacherRepository.findById(parseInt(teacherId))
    if (!updatedTeacher) {
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: 'Failed to retrieve updated teacher data'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Generate new JWT token with updated photo URL
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const newAuthToken = await tokenService.generateToken(updatedTeacher)

    // Create response with new token
    const response: UpdatePhotoResponseDTO = {
      success: true,
      photoUrl: photoUrl,
      message: 'Profile photo uploaded successfully',
      token: newAuthToken.getToken(),
      teacher: {
        id: updatedTeacher.getId(),
        firstname: updatedTeacher.getFirstname(),
        lastname: updatedTeacher.getLastname(),
        email: updatedTeacher.getEmailValue(),
        departement: updatedTeacher.getDepartement(),
        photoUrl: updatedTeacher.getPhotoUrl() || undefined
      }
    }

    // Create response and set auth cookie
    const nextResponse = NextResponse.json(response, { status: 200 })
    
    // Set authentication cookie for browser requests
    setAuthCookie(nextResponse, newAuthToken.getToken(), newAuthToken.getExpiresAt())

    return nextResponse

  } catch (error) {
    console.error('Photo upload API error:', error)
    
    const response: UpdatePhotoResponseDTO = {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 