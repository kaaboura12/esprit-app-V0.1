import { NextRequest, NextResponse } from 'next/server'
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository'
import { MySQLPasswordResetTokenRepository } from '@/infrastructure/repositories/MySQLPasswordResetTokenRepository'
import { EmailService } from '@/infrastructure/services/EmailService'
import { SendPasswordResetCodeUseCase } from '@/application/use-cases/SendPasswordResetCodeUseCase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Send password reset code
    const teacherRepository = new MySQLTeacherRepository()
    const passwordResetTokenRepository = new MySQLPasswordResetTokenRepository()
    const emailService = new EmailService()
    
    const sendPasswordResetCodeUseCase = new SendPasswordResetCodeUseCase(
      teacherRepository,
      passwordResetTokenRepository,
      emailService
    )
    
    const result = await sendPasswordResetCodeUseCase.execute(email)

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
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
} 