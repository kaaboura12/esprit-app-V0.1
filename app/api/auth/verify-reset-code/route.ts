import { NextRequest, NextResponse } from 'next/server'
import { MySQLPasswordResetTokenRepository } from '@/infrastructure/repositories/MySQLPasswordResetTokenRepository'
import { VerifyPasswordResetCodeUseCase } from '@/application/use-cases/VerifyPasswordResetCodeUseCase'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code de vérification requis' },
        { status: 400 }
      )
    }

    // Verify password reset code
    const passwordResetTokenRepository = new MySQLPasswordResetTokenRepository()
    const verifyPasswordResetCodeUseCase = new VerifyPasswordResetCodeUseCase(
      passwordResetTokenRepository
    )
    
    const result = await verifyPasswordResetCodeUseCase.execute(code)

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: result.message,
          email: result.email
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
    console.error('Verify reset code error:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la vérification du code' },
      { status: 500 }
    )
  }
} 