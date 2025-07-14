import { AuthToken } from "../entities/AuthToken"
import { Teacher } from "../entities/Teacher"

/**
 * Token Service Interface - Core business logic
 * This defines the contract for JWT token operations
 */
export interface TokenService {
  generateToken(teacher: Teacher): Promise<AuthToken>
  verifyToken(token: string): Promise<AuthToken | null>
  refreshToken(token: string): Promise<AuthToken | null>
} 