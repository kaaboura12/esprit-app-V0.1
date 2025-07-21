import { NextRequest, NextResponse } from 'next/server'
import { LoginUseCase } from '@/application/use-cases/LoginUseCase'
import { MySQLAuthRepository } from '@/infrastructure/repositories/MySQLAuthRepository'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { LoginRequestDTO, AuthResponseDTO } from '@/application/dtos/AuthDTO'
import { setAuthCookie } from '@/infrastructure/middleware/authMiddleware'
import { Email } from '@/core/value-objects/Email'

/**
 * POST /api/auth/login
 * Handles teacher login requests with MySQL database
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: LoginRequestDTO = await request.json()
    
    if (!body.email || !body.password) {
      const response: AuthResponseDTO = {
        success: false,
        error: 'Email and password are required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Initialize dependencies with MySQL repository
    const authRepository = new MySQLAuthRepository()
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const loginUseCase = new LoginUseCase(authRepository, tokenService)

    // Execute login use case
    const result = await loginUseCase.execute(body.email, body.password)

    if (!result.success || !result.token) {
      const response: AuthResponseDTO = {
        success: false,
        error: result.error || 'Login failed'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Find teacher details for response
    const authToken = result.token
    const teacher = await authRepository.findTeacherByEmail(new Email(body.email))

    if (!teacher) {
      const response: AuthResponseDTO = {
        success: false,
        error: 'Teacher not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Update last login timestamp
    if (authRepository instanceof MySQLAuthRepository) {
      await authRepository.updateLastLogin(teacher.getId())
    }

    // Prepare successful response
    const response: AuthResponseDTO = {
      success: true,
      token: authToken.getToken(),
      teacher: {
        id: teacher.getId(),
        firstname: teacher.getFirstname(),
        lastname: teacher.getLastname(),
        email: teacher.getEmailValue(),
        departement: teacher.getDepartement(),
        photoUrl: teacher.getPhotoUrl() || undefined
      },
      expiresAt: authToken.getExpiresAt().toISOString()
    }

    // Create response and set auth cookie
    const nextResponse = NextResponse.json(response, { status: 200 })
    
    // Set authentication cookie for browser requests
    setAuthCookie(nextResponse, authToken.getToken(), authToken.getExpiresAt())

    return nextResponse

  } catch (error) {
    console.error('Login API error:', error)
    
    const response: AuthResponseDTO = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 