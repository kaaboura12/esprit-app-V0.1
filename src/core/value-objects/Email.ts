/**
 * Email Value Object - Domain layer
 * This represents an email address with validation rules
 */
export class Email {
  private readonly value: string

  constructor(email: string) {
    this.validateEmail(email)
    this.value = email.toLowerCase().trim()
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format')
    }

    if (email.length > 254) {
      throw new Error('Email cannot exceed 254 characters')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  // Business rule: Check if email is from educational domain
  isEducationalDomain(): boolean {
    return this.value.endsWith('.edu') || this.value.includes('esprit')
  }

  getDomain(): string {
    return this.value.split('@')[1]
  }

  getLocalPart(): string {
    return this.value.split('@')[0]
  }
} 