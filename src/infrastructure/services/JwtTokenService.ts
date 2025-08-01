import { SignJWT, jwtVerify } from 'jose'
import { TokenService } from "@/core/interfaces/TokenService"
import { AuthToken } from "@/core/entities/AuthToken"
import { Teacher } from "@/core/entities/Teacher"

/**
 * JWT Token Service Implementation - Infrastructure layer
 * This implements JWT token operations using jose library
 */
export class JwtTokenService implements TokenService {
  private readonly secret: Uint8Array
  private readonly expirationTime = '24h' // Default token expiration


  constructor(secretKey?: string) {
    const key = secretKey || process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    this.secret = new TextEncoder().encode(key)
  }

  async generateToken(teacher: Teacher, rememberMe: boolean = false): Promise<AuthToken> {
    const now = new Date()
    
    // Set expiration based on remember me option
    let expiresAt: Date
    let expirationTime: string
    
    if (rememberMe) {
      // 30 days for "Remember me"
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      expirationTime = '30d'
    } else {
      // 24 hours for regular login
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      expirationTime = '24h'
    }

    const payload = {
      teacherId: teacher.getId(),
      email: teacher.getEmailValue(),
      firstname: teacher.getFirstname(),
      lastname: teacher.getLastname(),
      departement: teacher.getDepartement(),
      photoUrl: teacher.getPhotoUrl(),
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000)
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(this.secret)

    return new AuthToken(
      token,
      teacher.getId(),
      teacher.getEmailValue(),
      now,
      expiresAt
    )
  }

  async verifyToken(token: string): Promise<AuthToken | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret)
      
      if (!payload.teacherId || !payload.email || !payload.exp) {
        return null
      }

      const teacherId = Number(payload.teacherId)
      const email = String(payload.email)
      const issuedAt = payload.iat ? new Date(Number(payload.iat) * 1000) : new Date()
      const expiresAt = new Date(Number(payload.exp) * 1000)

      const authToken = new AuthToken(
        token,
        teacherId,
        email,
        issuedAt,
        expiresAt
      )

      return authToken.isValid() ? authToken : null

    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  async refreshToken(token: string): Promise<AuthToken | null> {
    try {
      const authToken = await this.verifyToken(token)
      if (!authToken) {
        return null
      }

      // Check if token expires soon (within 15 minutes)
      if (!authToken.expiresSoon()) {
        return authToken // Return existing token if not expiring soon
      }

      // For refresh, we need to get teacher data from the token
      // In a real implementation, you might want to fetch fresh teacher data from database
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

      const payload = {
        teacherId: authToken.getTeacherId(),
        email: authToken.getEmail(),
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000)
      }

      const newToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(this.expirationTime)
        .sign(this.secret)

      return new AuthToken(
        newToken,
        authToken.getTeacherId(),
        authToken.getEmail(),
        now,
        expiresAt
      )

    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }
} 