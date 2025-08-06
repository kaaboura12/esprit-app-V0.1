import { TeacherRepository } from "@/core/interfaces/TeacherRepository"
import { PasswordResetTokenRepository } from "@/core/interfaces/PasswordResetTokenRepository"
import { Teacher } from "@/core/entities/Teacher"
import { MySQLAuthRepository } from "@/infrastructure/repositories/MySQLAuthRepository"

export class ResetPasswordUseCase {
  constructor(
    private teacherRepository: TeacherRepository,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private authRepository: MySQLAuthRepository
  ) {}

  async execute(code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find token by code
      const token = await this.passwordResetTokenRepository.findByCode(code)
      
      if (!token) {
        return {
          success: false,
          message: 'Code de vérification invalide'
        }
      }

      // Check if token is valid
      if (!token.isValid()) {
        if (token.isExpired()) {
          return {
            success: false,
            message: 'Le code de vérification a expiré. Veuillez demander un nouveau code.'
          }
        } else {
          return {
            success: false,
            message: 'Ce code de vérification a déjà été utilisé'
          }
        }
      }

      // Get teacher by email
      const teacher = await this.teacherRepository.findByEmail(token.getEmailValue())
      if (!teacher) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        }
      }

      // Hash the new password
      const hashedPassword = await this.authRepository.hashPassword(newPassword)

      // Create updated teacher with hashed password
      const updatedTeacher = teacher.withNewPassword(hashedPassword)

      // Update teacher password in database
      await this.teacherRepository.save(updatedTeacher)
      
      // Mark token as used
      const usedToken = token.markAsUsed()
      await this.passwordResetTokenRepository.save(usedToken)
      
      return {
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès'
      }
      
    } catch (error) {
      console.error('Error in ResetPasswordUseCase:', error)
      throw new Error('Une erreur est survenue lors de la réinitialisation du mot de passe')
    }
  }
} 