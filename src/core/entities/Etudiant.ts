import { Email } from "../value-objects/Email"
import { StudentNumber } from "../value-objects/StudentNumber"

/**
 * Etudiant (Student) Entity - Domain layer
 * This represents a student with business rules
 */
export class Etudiant {
  constructor(
    private readonly id: number,
    private readonly firstname: string,
    private readonly lastname: string,
    private readonly email: Email,
    private readonly classeId: number,
    private readonly numeroEtudiant: StudentNumber,
    private readonly dateNaissance: Date | null = null
  ) {
    this.validateEtudiant()
  }

  private validateEtudiant(): void {
    if (!this.firstname || this.firstname.trim().length === 0) {
      throw new Error('First name cannot be empty')
    }

    if (this.firstname.length > 50) {
      throw new Error('First name cannot exceed 50 characters')
    }

    if (!this.lastname || this.lastname.trim().length === 0) {
      throw new Error('Last name cannot be empty')
    }

    if (this.lastname.length > 50) {
      throw new Error('Last name cannot exceed 50 characters')
    }

    if (this.classeId <= 0) {
      throw new Error('Class ID must be positive')
    }

    // Student number validation is handled by the StudentNumber value object

    if (this.dateNaissance && this.dateNaissance > new Date()) {
      throw new Error('Birth date cannot be in the future')
    }

    if (this.dateNaissance && this.getAge() < 16) {
      throw new Error('Student must be at least 16 years old')
    }
  }

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

  getClasseId(): number {
    return this.classeId
  }

  getNumeroEtudiant(): StudentNumber {
    return this.numeroEtudiant
  }

  getNumeroEtudiantValue(): string {
    return this.numeroEtudiant.getValue()
  }

  getDateNaissance(): Date | null {
    return this.dateNaissance
  }

  // Business rule: Get full name
  getFullName(): string {
    return `${this.firstname} ${this.lastname}`
  }

  // Business rule: Get initials
  getInitials(): string {
    return `${this.firstname.charAt(0)}${this.lastname.charAt(0)}`.toUpperCase()
  }

  // Business rule: Calculate age
  getAge(): number {
    if (!this.dateNaissance) return 0
    
    const today = new Date()
    const birthDate = new Date(this.dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Business rule: Check if student is adult
  isAdult(): boolean {
    return this.getAge() >= 18
  }

  // Business rule: Check if student is minor
  isMinor(): boolean {
    return this.getAge() < 18
  }

  // Business rule: Check if student has valid email
  hasValidEmail(): boolean {
    return this.email !== null
  }

  // Business rule: Check if student has educational email
  hasEducationalEmail(): boolean {
    return this.email.isEducationalDomain()
  }

  // Business rule: Get academic year based on student number
  getAcademicYear(): number {
    return this.numeroEtudiant.getAcademicYear()
  }

  // Business rule: Check if student is new (current academic year)
  isNewStudent(): boolean {
    return this.numeroEtudiant.isNewStudent()
  }

  // Business rule: Get student generation
  getGeneration(): string {
    return this.numeroEtudiant.getGeneration()
  }

  // Business rule: Check if student number is valid format
  hasValidStudentNumber(): boolean {
    return true // StudentNumber value object ensures validity
  }

  // Business rule: Get display name for UI
  getDisplayName(): string {
    return `${this.getFullName()} (${this.numeroEtudiant.getValue()})`
  }

  // Business rule: Check if student can graduate (age >= 20)
  canGraduate(): boolean {
    return this.getAge() >= 20
  }

  // Business rule: Get student status
  getStatus(): 'active' | 'new' | 'senior' {
    if (this.isNewStudent()) return 'new'
    if (this.canGraduate()) return 'senior'
    return 'active'
  }

  // Factory method for creating a student
  static create(
    id: number,
    firstname: string,
    lastname: string,
    email: string,
    classeId: number,
    numeroEtudiant: string,
    dateNaissance?: Date
  ): Etudiant {
    const emailVO = new Email(email)
    const studentNumberVO = new StudentNumber(numeroEtudiant)
    return new Etudiant(id, firstname, lastname, emailVO, classeId, studentNumberVO, dateNaissance || null)
  }

  // Factory method to create updated student with new class
  withClasse(classeId: number): Etudiant {
    return new Etudiant(
      this.id,
      this.firstname,
      this.lastname,
      this.email,
      classeId,
      this.numeroEtudiant,
      this.dateNaissance
    )
  }

  // Factory method to create updated student with new email
  withEmail(email: string): Etudiant {
    const emailVO = new Email(email)
    return new Etudiant(
      this.id,
      this.firstname,
      this.lastname,
      emailVO,
      this.classeId,
      this.numeroEtudiant,
      this.dateNaissance
    )
  }
} 