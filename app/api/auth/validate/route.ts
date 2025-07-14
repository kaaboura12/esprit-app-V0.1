import { NextRequest, NextResponse } from 'next/server'
import { ValidateTokenUseCase } from '@/application/use-cases/ValidateTokenUseCase'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { ValidateTokenRequestDTO, ValidateTokenResponseDTO } from '@/application/dtos/AuthDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'

/**
 * POST /api/auth/validate
 * Validates JWT tokens
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Try to get token from request body first, then from cookies
    let token: string | null = null
    
    try {
      const body: ValidateTokenRequestDTO = await request.json()
      token = body.token
    } catch {
      // If no body or invalid JSON, try to get from cookies
      token = getTokenFromCookies(request)
    }

    if (!token) {
      const response: ValidateTokenResponseDTO = {
        valid: false,
        error: 'Token is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Initialize dependencies
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const validateTokenUseCase = new ValidateTokenUseCase(tokenService)

    // Execute validation use case
    const result = await validateTokenUseCase.execute(token)

    if (!result.valid || !result.authToken) {
      const response: ValidateTokenResponseDTO = {
        valid: false,
        error: result.error || 'Invalid token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get teacher information from token payload
    const tokenService2 = JwtTokenServiceSingleton.getInstance()
    const { payload } = await import('jose').then(jose => jose.jwtVerify(token, (tokenService2 as any).secret))

    // Prepare successful response with complete teacher information
    const response: ValidateTokenResponseDTO = {
      valid: true,
      teacher: {
        id: result.authToken.getTeacherId(),
        firstname: String(payload.firstname || ''),
        lastname: String(payload.lastname || ''),
        email: result.authToken.getEmail(),
        departement: String(payload.departement || ''),
        photoUrl: payload.photoUrl ? String(payload.photoUrl) : undefined
      },
      expiresAt: result.authToken.getExpiresAt().toISOString()
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Token validation API error:', error)
    
    const response: ValidateTokenResponseDTO = {
      valid: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * GET /api/auth/validate
 * Validates JWT tokens from cookies (for browser requests)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = getTokenFromCookies(request)

    if (!token) {
      const response: ValidateTokenResponseDTO = {
        valid: false,
        error: 'No authentication token found'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Initialize dependencies
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const validateTokenUseCase = new ValidateTokenUseCase(tokenService)

    // Execute validation use case
    const result = await validateTokenUseCase.execute(token)

    if (!result.valid || !result.authToken) {
      const response: ValidateTokenResponseDTO = {
        valid: false,
        error: result.error || 'Invalid token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get teacher information from token payload
    const tokenService2 = JwtTokenServiceSingleton.getInstance()
    const { payload } = await import('jose').then(jose => jose.jwtVerify(token, (tokenService2 as any).secret))

    // Prepare successful response with complete teacher information
    const response: ValidateTokenResponseDTO = {
      valid: true,
      teacher: {
        id: result.authToken.getTeacherId(),
        firstname: String(payload.firstname || ''),
        lastname: String(payload.lastname || ''),
        email: result.authToken.getEmail(),
        departement: String(payload.departement || ''),
        photoUrl: payload.photoUrl ? String(payload.photoUrl) : undefined
      },
      expiresAt: result.authToken.getExpiresAt().toISOString()
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Token validation API error:', error)
    
    const response: ValidateTokenResponseDTO = {
      valid: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
} 