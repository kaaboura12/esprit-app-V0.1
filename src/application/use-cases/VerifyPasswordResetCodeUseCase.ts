import { PasswordResetTokenRepository } from "@/core/interfaces/PasswordResetTokenRepository"

export class VerifyPasswordResetCodeUseCase {
  constructor(
    private passwordResetTokenRepository: PasswordResetTokenRepository
  ) {}

  async execute(code: string): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      // Find token by code
      const token = await this.passwordResetTokenRepository.findByCode(code)
      
      if (!token) {
        return {
          success: false,
          message: 'Code de vérification invalide'
        }
      }

      // Check if token is valid (not expired and not used)
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

      return {
        success: true,
        message: 'Code de vérification valide',
        email: token.getEmailValue()
      }
      
    } catch (error) {
      console.error('Error in VerifyPasswordResetCodeUseCase:', error)
      throw new Error('Une erreur est survenue lors de la vérification du code')
    }
  }
} 