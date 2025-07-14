import { TokenService } from "@/core/interfaces/TokenService"
import { AuthToken } from "@/core/entities/AuthToken"

/**
 * Validate Token Use Case - Application layer
 * This handles JWT token validation business logic
 */
export class ValidateTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(token: string): Promise<{
    valid: boolean
    authToken?: AuthToken
    error?: string
  }> {
    try {
      // Validate input
      if (!token || token.trim().length === 0) {
        return {
          valid: false,
          error: 'Token is required'
        }
      }

      // Verify token using token service
      const authToken = await this.tokenService.verifyToken(token)
      
      if (!authToken) {
        return {
          valid: false,
          error: 'Invalid or expired token'
        }
      }

      // Check if token is still valid (business rule)
      if (!authToken.isValid()) {
        return {
          valid: false,
          error: 'Token has expired'
        }
      }

      return {
        valid: true,
        authToken
      }

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      }
    }
  }
} 