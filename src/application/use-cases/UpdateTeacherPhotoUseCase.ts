import { TeacherRepository } from "@/core/interfaces/TeacherRepository"
import { UpdatePhotoRequestDTO, UpdatePhotoResponseDTO } from "@/application/dtos/TeacherDTO"

/**
 * Use Case - Application layer
 * This handles the business logic for updating teacher profile photos
 */
export class UpdateTeacherPhotoUseCase {
  constructor(private teacherRepository: TeacherRepository) {}

  async execute(request: UpdatePhotoRequestDTO): Promise<UpdatePhotoResponseDTO> {
    try {
      // Validate input
      if (!request.teacherId || request.teacherId <= 0) {
        return {
          success: false,
          message: 'Invalid teacher ID provided'
        }
      }

      if (!request.photoUrl || request.photoUrl.trim().length === 0) {
        return {
          success: false,
          message: 'Photo URL is required'
        }
      }

      // Validate photo URL format
      const urlPattern = /^(https?:\/\/|\/)/
      if (!urlPattern.test(request.photoUrl)) {
        return {
          success: false,
          message: 'Invalid photo URL format'
        }
      }

      // Check if teacher exists
      const teacher = await this.teacherRepository.findById(request.teacherId)
      if (!teacher) {
        return {
          success: false,
          message: 'Teacher not found'
        }
      }

      // Update teacher photo in repository
      await this.teacherRepository.updatePhoto(request.teacherId, request.photoUrl)

      return {
        success: true,
        photoUrl: request.photoUrl,
        message: 'Profile photo updated successfully'
      }

    } catch (error) {
      console.error('Error updating teacher photo:', error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile photo'
      }
    }
  }
} 