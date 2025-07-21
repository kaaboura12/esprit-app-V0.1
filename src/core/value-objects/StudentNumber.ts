/**
 * StudentNumber Value Object - Domain layer
 * This represents a student number with validation rules
 */
export class StudentNumber {
  private readonly value: string

  constructor(studentNumber: string) {
    this.validateStudentNumber(studentNumber)
    this.value = studentNumber.trim()
  }

  private validateStudentNumber(studentNumber: string): void {
    if (!studentNumber || studentNumber.trim().length === 0) {
      throw new Error('Student number cannot be empty')
    }

    if (studentNumber.length > 20) {
      throw new Error('Student number cannot exceed 20 characters')
    }

    // More flexible validation: accept any student number that starts with 4 digits (year) 
    // followed by additional digits/letters
    const pattern = /^\d{4}[\w\d]+$/
    if (!pattern.test(studentNumber.trim())) {
      throw new Error('Student number must start with a 4-digit year followed by additional characters (e.g., 2024001)')
    }

    const year = parseInt(studentNumber.substring(0, 4))
    const currentYear = new Date().getFullYear()
    
    if (year < 2000 || year > currentYear + 1) {
      throw new Error(`Student number year must be between 2000 and ${currentYear + 1}`)
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: StudentNumber): boolean {
    return this.value === other.value
  }

  // Business rule: Get academic year from student number
  getAcademicYear(): number {
    return parseInt(this.value.substring(0, 4))
  }

  // Business rule: Get sequential number (everything after year)
  getSequentialNumber(): string {
    return this.value.substring(4)
  }

  // Business rule: Check if student is from current academic year
  isCurrentYear(): boolean {
    return this.getAcademicYear() === new Date().getFullYear()
  }

  // Business rule: Check if student is new (from current or next year)
  isNewStudent(): boolean {
    const currentYear = new Date().getFullYear()
    const studentYear = this.getAcademicYear()
    return studentYear === currentYear || studentYear === currentYear + 1
  }

  // Business rule: Get generation identifier
  getGeneration(): string {
    return `Gen${this.getAcademicYear()}`
  }

  // Business rule: Get formatted display
  getDisplayFormat(): string {
    const year = this.getAcademicYear()
    const sequence = this.getSequentialNumber()
    return `${year}-${sequence}`
  }
} 