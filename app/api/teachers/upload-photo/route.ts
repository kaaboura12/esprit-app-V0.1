import { NextRequest, NextResponse } from 'next/server'
import { UpdateTeacherPhotoUseCase } from '@/application/use-cases/UpdateTeacherPhotoUseCase'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { UpdatePhotoRequestDTO, UpdatePhotoResponseDTO } from '@/application/dtos/TeacherDTO'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'teachers')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `teacher_${teacherId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

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
      const response: UpdatePhotoResponseDTO = {
        success: false,
        message: result.message || 'Failed to update teacher photo'
      }
      return NextResponse.json(response, { status: 500 })
    }

    const response: UpdatePhotoResponseDTO = {
      success: true,
      photoUrl: photoUrl,
      message: 'Profile photo uploaded successfully'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Photo upload API error:', error)
    
    const response: UpdatePhotoResponseDTO = {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 