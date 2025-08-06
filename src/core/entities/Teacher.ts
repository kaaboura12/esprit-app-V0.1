import { Email } from "../value-objects/Email"
import { Password } from "../value-objects/Password"

/**
 * Domain Entity - Core business logic
 * This represents the Teacher entity with business rules
 */
export class Teacher {
  constructor(
    private readonly id: number,
    private readonly firstname: string,
    private readonly lastname: string,
    private readonly email: Email,
    private readonly departement: string,
    private readonly hashedPassword: string, // Store hashed password, not plain text
    private readonly photoUrl?: string, // Optional photo URL
    private readonly role: string = 'teacher' // Default role is teacher
  ) {}

  getId(): number {
    return this.id
  }

  getFirstname(): string {
    return this.firstname
  }

  getLastname(): string {
    return this.lastname
  }

  getEmail(): Email {
    return this.email
  }

  getEmailValue(): string {
    return this.email.getValue()
  }

  getDepartement(): string {
    return this.departement
  }

  getHashedPassword(): string {
    return this.hashedPassword
  }

  getPhotoUrl(): string | null {
    return this.photoUrl || null
  }

  getRole(): string {
    return this.role
  }

  // Business rule: Check if teacher is admin
  isAdmin(): boolean {
    return this.role === 'admin'
  }

  // Business rule: Check if teacher is regular teacher
  isTeacher(): boolean {
    return this.role === 'teacher'
  }

  // Business rule: Check if teacher has a profile photo
  hasProfilePhoto(): boolean {
    return this.photoUrl !== null && this.photoUrl !== undefined && this.photoUrl.trim().length > 0
  }

  // Business rule: Full name combination
  getFullName(): string {
    return `${this.firstname} ${this.lastname}`
  }

  // Business rule: Get initials for display when no photo
  getInitials(): string {
    return `${this.firstname.charAt(0)}${this.lastname.charAt(0)}`.toUpperCase()
  }

  // Business rule: Email validation (delegated to Email value object)
  isValidEmail(): boolean {
    return true // Email is always valid if it passed value object validation
  }

  // Business rule: Department validation
  isValidDepartement(): boolean {
    return this.departement.trim().length > 0
  }

  // Business rule: Role validation
  isValidRole(): boolean {
    return ['teacher', 'admin'].includes(this.role)
  }

  // Business rule: Photo URL validation
  isValidPhotoUrl(): boolean {
    if (!this.photoUrl) return true // Optional field
    
    const urlPattern = /^(https?:\/\/|\/)/
    return urlPattern.test(this.photoUrl)
  }

  // Business rule: Check if teacher has educational email
  hasEducationalEmail(): boolean {
    return this.email.isEducationalDomain()
  }

  // Business rule: Check if teacher can access admin features
  canAccessAdminFeatures(): boolean {
    return this.isAdmin() || 
           this.departement.toLowerCase().includes('admin') || 
           this.departement.toLowerCase().includes('direction')
  }

  // Factory method for creating a teacher with password validation
  static create(
    id: number,
    firstname: string,
    lastname: string,
    email: string,
    departement: string,
    plainPassword: string,
    photoUrl?: string,
    role: string = 'teacher'
  ): { teacher: Teacher, validatedPassword: Password } {
    const emailVO = new Email(email)
    const passwordVO = new Password(plainPassword)
    
    // Note: In real implementation, password would be hashed here
    // For now, we'll pass the plain password (should be hashed in infrastructure layer)
    const teacher = new Teacher(id, firstname, lastname, emailVO, departement, plainPassword, photoUrl, role)
    
    return { teacher, validatedPassword: passwordVO }
  }

  // Factory method to create updated teacher with new photo
  withPhoto(photoUrl: string): Teacher {
    return new Teacher(
      this.id,
      this.firstname,
      this.lastname,
      this.email,
      this.departement,
      this.hashedPassword,
      photoUrl,
      this.role
    )
  }

  // Factory method to create updated teacher with new role
  withRole(role: string): Teacher {
    return new Teacher(
      this.id,
      this.firstname,
      this.lastname,
      this.email,
      this.departement,
      this.hashedPassword,
      this.photoUrl,
      role
    )
  }
} 