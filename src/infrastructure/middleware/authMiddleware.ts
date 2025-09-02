import { NextRequest, NextResponse } from 'next/server'
import { ValidateTokenUseCase } from '@/application/use-cases/ValidateTokenUseCase'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * Authentication Middleware - Infrastructure layer
 * This middleware validates JWT tokens for protected routes
 */

export interface AuthenticatedRequest extends NextRequest {
  teacher?: {
    id: number
    email: string
    firstname: string
    lastname: string
    departement: string
    role: string
  }
}

export async function authMiddleware(request: NextRequest): Promise<{
  isAuthenticated: boolean
  teacher?: any
  error?: string
}> {
  try {
    let token: string | null = null

    // First try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // Remove 'Bearer ' prefix
    }

    // If no token in header, try to get from cookies (for browser requests)
    if (!token) {
      token = getTokenFromCookies(request)
    }

    if (!token) {
      return {
        isAuthenticated: false,
        error: 'No authentication token found'
      }
    }

    // Validate token using use case
    const tokenService = JwtTokenServiceSingleton.getInstance()
    const validateTokenUseCase = new ValidateTokenUseCase(tokenService)
    
    const result = await validateTokenUseCase.execute(token)

    if (!result.valid || !result.authToken) {
      return {
        isAuthenticated: false,
        error: result.error || 'Invalid token'
      }
    }

    // Extract teacher information from token
    const teacher = {
      id: result.authToken.getTeacherId(),
      email: result.authToken.getEmail(),
      role: result.authToken.getRole()
    }

    return {
      isAuthenticated: true,
      teacher
    }

  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      isAuthenticated: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authMiddleware(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Add teacher info to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.teacher = authResult.teacher

    return handler(authenticatedRequest)
  }
}

/**
 * Higher-order function to protect admin-only API routes
 */
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authMiddleware(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (authResult.teacher?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Add teacher info to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.teacher = authResult.teacher

    return handler(authenticatedRequest)
  }
}

/**
 * Extract token from cookies (for browser requests)
 */
export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth_token')?.value || null
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(response: NextResponse, token: string, expiresAt: Date, rememberMe: boolean = false): void {
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV !== 'true',
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better Docker compatibility
    path: '/'
  }

  if (rememberMe) {
    // For "Remember me", set a longer expiration
    cookieOptions.maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
  } else {
    // For regular login, use the token's expiration
    cookieOptions.expires = expiresAt
  }

  response.cookies.set('auth_token', token, cookieOptions)
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete('auth_token')
} 