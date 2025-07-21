/**
 * Password Value Object - Domain layer
 * This represents a password with validation and security rules
 */
export class Password {
  private readonly value: string

  constructor(password: string) {
    this.validatePassword(password)
    this.value = password
  }

  private validatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      throw new Error('Password cannot exceed 128 characters')
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if (!hasLetter || !hasNumber) {
      throw new Error('Password must contain at least one letter and one number')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: Password): boolean {
    return this.value === other.value
  }

  // Business rule: Check if password meets security requirements
  isStrong(): boolean {
    const hasUpperCase = /[A-Z]/.test(this.value)
    const hasLowerCase = /[a-z]/.test(this.value)
    const hasNumbers = /\d/.test(this.value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.value)
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && this.value.length >= 12
  }
} 