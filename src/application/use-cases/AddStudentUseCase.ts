import { StudentRepository } from '@/core/interfaces/StudentRepository'
import { Etudiant } from '@/core/entities/Etudiant'
import { Email } from '@/core/value-objects/Email'
import { StudentNumber } from '@/core/value-objects/StudentNumber'

export interface AddStudentRequest {
  firstname: string
  lastname: string
  email: string
  numeroEtudiant: string
  classeId: number
  dateNaissance?: Date
}

export interface AddStudentResponse {
  success: boolean
  student?: Etudiant
  error?: string
}

/**
 * AddStudentUseCase - Application layer
 * Handles the business logic for adding a new student to a class
 */
export class AddStudentUseCase {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(request: AddStudentRequest): Promise<AddStudentResponse> {
    try {
      // Validate required fields
      if (!request.firstname?.trim()) {
        return { success: false, error: 'Le prénom est requis' }
      }

      if (!request.lastname?.trim()) {
        return { success: false, error: 'Le nom est requis' }
      }

      if (!request.email?.trim()) {
        return { success: false, error: 'L\'email est requis' }
      }

      if (!request.numeroEtudiant?.trim()) {
        return { success: false, error: 'Le numéro étudiant est requis' }
      }

      if (!request.classeId || request.classeId <= 0) {
        return { success: false, error: 'L\'ID de classe est requis' }
      }

      // Create value objects with validation
      let email: Email
      let studentNumber: StudentNumber

      try {
        email = new Email(request.email.trim())
      } catch (error) {
        return { success: false, error: 'Format d\'email invalide' }
      }

      try {
        studentNumber = new StudentNumber(request.numeroEtudiant.trim())
      } catch (error) {
        return { success: false, error: 'Format de numéro étudiant invalide' }
      }

      // Check if email already exists
      const existingStudentByEmail = await this.studentRepository.findByEmail(email)
      if (existingStudentByEmail) {
        return { success: false, error: 'Un étudiant avec cet email existe déjà' }
      }

      // Check if student number already exists
      const existingStudentByNumber = await this.studentRepository.findByStudentNumber(studentNumber)
      if (existingStudentByNumber) {
        return { success: false, error: 'Un étudiant avec ce numéro existe déjà' }
      }

      // Create new student entity
      const student = Etudiant.create(
        0, // ID will be set by database
        request.firstname.trim(),
        request.lastname.trim(),
        request.email.trim(),
        request.classeId,
        request.numeroEtudiant.trim(),
        request.dateNaissance || undefined
      )

      // Save student to repository
      const savedStudent = await this.studentRepository.create(student)

      return {
        success: true,
        student: savedStudent
      }

    } catch (error) {
      console.error('AddStudentUseCase error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      }
    }
  }
} 