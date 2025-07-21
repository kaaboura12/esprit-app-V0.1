import { Etudiant } from "@/core/entities/Etudiant"
import { StudentRepository } from "@/core/interfaces/StudentRepository"

/**
 * Application Use Case - Business application logic
 * This handles the application-specific business rules for getting students by class
 */
export class GetStudentsByClasseUseCase {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(classeId: number): Promise<Etudiant[]> {
    // Application logic - validate input
    if (!classeId || classeId <= 0) {
      throw new Error('Class ID is required and must be positive')
    }

    // Delegate to repository
    const students = await this.studentRepository.findByClasseId(classeId)
    
    // Application logic - business rules
    // Filter out students with invalid data
    const validStudents = students.filter(student => {
      return student.hasValidEmail() && student.hasValidStudentNumber()
    })

    // Sort students by last name, then first name
    validStudents.sort((a, b) => {
      const lastNameComparison = a.getLastname().localeCompare(b.getLastname())
      if (lastNameComparison !== 0) {
        return lastNameComparison
      }
      return a.getFirstname().localeCompare(b.getFirstname())
    })

    return validStudents
  }
} 