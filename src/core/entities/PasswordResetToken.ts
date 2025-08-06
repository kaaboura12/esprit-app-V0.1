import { Email } from "../value-objects/Email"

/**
 * Domain Entity - Password Reset Token
 * This represents a password reset token with verification code
 */
export class PasswordResetToken {
  constructor(
    private readonly id: string,
    private readonly email: Email,
    private readonly code: string,
    private readonly expiresAt: Date,
    private readonly isUsed: boolean = false,
    private readonly createdAt: Date = new Date()
  ) {}

  getId(): string {
    return this.id
  }

  getEmail(): Email {
    return this.email
  }

  getEmailValue(): string {
    return this.email.getValue()
  }

  getCode(): string {
    return this.code
  }

  getExpiresAt(): Date {
    return this.expiresAt
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  getIsUsed(): boolean {
    return this.isUsed
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  // Business rule: Check if token is valid (not expired and not used)
  isValid(): boolean {
    return !this.isExpired() && !this.getIsUsed()
  }

  // Factory method to create a new password reset token
  static create(email: string): { token: PasswordResetToken, code: string } {
    const emailVO = new Email(email)
    const id = crypto.randomUUID()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase() // 6-character code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    
    const token = new PasswordResetToken(id, emailVO, code, expiresAt)
    
    return { token, code }
  }

  // Factory method to mark token as used
  markAsUsed(): PasswordResetToken {
    return new PasswordResetToken(
      this.id,
      this.email,
      this.code,
      this.expiresAt,
      true,
      this.createdAt
    )
  }
} 