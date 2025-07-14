import { Teacher } from "../entities/Teacher"
import { Email } from "../value-objects/Email"

/**
 * Authentication Repository Interface - Core business logic
 * This defines the contract for authentication operations
 */
export interface AuthRepository {
  findTeacherByEmail(email: Email): Promise<Teacher | null>
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>
  hashPassword(plainPassword: string): Promise<string>
} 