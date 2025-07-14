import { Teacher } from "@/core/entities/Teacher"
import { TeacherRepository } from "@/core/interfaces/TeacherRepository"

/**
 * Application Use Case - Business application logic
 * This handles the application-specific business rules for teachers
 */
export class GetTeacherUseCase {
  constructor(private readonly teacherRepository: TeacherRepository) {}

  async execute(teacherId: number): Promise<Teacher | null> {
    // Application logic - validate input
    if (!teacherId || teacherId <= 0) {
      throw new Error('Teacher ID is required and must be positive')
    }

    // Delegate to repository
    const teacher = await this.teacherRepository.findById(teacherId)
    
    if (!teacher) {
      return null
    }

    // Application logic - business rules
    if (!teacher.isValidEmail()) {
      throw new Error('Teacher has invalid email')
    }

    if (!teacher.isValidDepartement()) {
      throw new Error('Teacher has invalid department')
    }

    return teacher
  }
} 