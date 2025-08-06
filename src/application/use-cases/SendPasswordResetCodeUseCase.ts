import { TeacherRepository } from "@/core/interfaces/TeacherRepository"
import { PasswordResetTokenRepository } from "@/core/interfaces/PasswordResetTokenRepository"
import { EmailService } from "@/infrastructure/services/EmailService"
import { PasswordResetToken } from "@/core/entities/PasswordResetToken"

export class SendPasswordResetCodeUseCase {
  constructor(
    private teacherRepository: TeacherRepository,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private emailService: EmailService
  ) {}

  async execute(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if teacher exists
      const teacher = await this.teacherRepository.findByEmail(email)
      if (!teacher) {
        return {
          success: false,
          message: 'Aucun compte trouvé avec cette adresse email'
        }
      }

      // Create password reset token
      const { token, code } = PasswordResetToken.create(email)
      
      // Save token to database
      await this.passwordResetTokenRepository.save(token)
      
      // Send verification code via email
      await this.emailService.sendPasswordResetEmail(email, code)
      
      return {
        success: true,
        message: 'Un code de vérification a été envoyé à votre adresse email'
      }
      
    } catch (error) {
      console.error('Error in SendPasswordResetCodeUseCase:', error)
      throw new Error('Une erreur est survenue lors de l\'envoi du code de vérification')
    }
  }
} 