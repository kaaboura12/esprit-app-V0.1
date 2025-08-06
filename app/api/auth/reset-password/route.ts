import { NextRequest, NextResponse } from 'next/server'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { MySQLPasswordResetTokenRepository } from '@/infrastructure/repositories/MySQLPasswordResetTokenRepository'
import { MySQLAuthRepository } from '@/infrastructure/repositories/MySQLAuthRepository'
import { ResetPasswordUseCase } from '@/application/use-cases/ResetPasswordUseCase'

export async function POST(request: NextRequest) {
  try {
    const { code, newPassword } = await request.json()

    if (!code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Code de vérification et nouveau mot de passe requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Additional password strength validation
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins une lettre majuscule' },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins une lettre minuscule' },
        { status: 400 }
      )
    }

    if (!/\d/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins un chiffre' },
        { status: 400 }
      )
    }

    // Reset password
    const teacherRepository = new MySQLTeacherRepository()
    const passwordResetTokenRepository = new MySQLPasswordResetTokenRepository()
    const authRepository = new MySQLAuthRepository()
    
    const resetPasswordUseCase = new ResetPasswordUseCase(
      teacherRepository,
      passwordResetTokenRepository,
      authRepository
    )
    
    const result = await resetPasswordUseCase.execute(code, newPassword)

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: result.message
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
} 