/**
 * AuthToken Entity - Domain layer
 * This represents an authentication token with business rules
 */
export class AuthToken {
  constructor(
    private readonly token: string,
    private readonly teacherId: number,
    private readonly email: string,
    private readonly issuedAt: Date,
    private readonly expiresAt: Date,
    private readonly role: string = 'teacher'
  ) {}

  getToken(): string {
    return this.token
  }

  getTeacherId(): number {
    return this.teacherId
  }

  getEmail(): string {
    return this.email
  }

  getRole(): string {
    return this.role
  }

  getIssuedAt(): Date {
    return this.issuedAt
  }

  getExpiresAt(): Date {
    return this.expiresAt
  }

  // Business rule: Check if token is expired
  isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  // Business rule: Check if token is valid (not expired and properly formatted)
  isValid(): boolean {
    return !this.isExpired() && this.token.length > 0 && this.teacherId > 0
  }

  // Business rule: Check if token expires soon (within 15 minutes)
  expiresSoon(): boolean {
    const now = new Date()
    const timeDiff = this.expiresAt.getTime() - now.getTime()
    const fifteenMinutes = 15 * 60 * 1000
    return timeDiff <= fifteenMinutes && timeDiff > 0
  }

  // Business rule: Get remaining time in minutes
  getRemainingTimeInMinutes(): number {
    const now = new Date()
    const timeDiff = this.expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.floor(timeDiff / (1000 * 60)))
  }

  // Business rule: Check if user has admin role
  isAdmin(): boolean {
    return this.role === 'admin'
  }

  // Business rule: Check if user has teacher role
  isTeacher(): boolean {
    return this.role === 'teacher'
  }
} 