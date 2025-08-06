import { PasswordResetToken } from "../entities/PasswordResetToken"

/**
 * Domain Repository Interface - Password Reset Token
 * This defines the contract for password reset token operations
 */
export interface PasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>
  findByEmail(email: string): Promise<PasswordResetToken | null>
  findByCode(code: string): Promise<PasswordResetToken | null>
  deleteByEmail(email: string): Promise<void>
  deleteExpired(): Promise<void>
} 