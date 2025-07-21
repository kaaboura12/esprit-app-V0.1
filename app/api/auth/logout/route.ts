import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/infrastructure/middleware/authMiddleware'

/**
 * POST /api/auth/logout
 * Handles teacher logout requests
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear authentication cookie
    clearAuthCookie(response)

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
} 