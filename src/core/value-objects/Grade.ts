/**
 * Grade Value Object - Domain layer
 * This represents a grade with validation rules
 */
export class Grade {
  private readonly value: number

  constructor(grade: number) {
    this.validateGrade(grade)
    this.value = Math.round(grade * 100) / 100 // Round to 2 decimal places
  }

  private validateGrade(grade: number): void {
    if (grade < 0 || grade > 20) {
      throw new Error('Grade must be between 0 and 20')
    }

    if (isNaN(grade)) {
      throw new Error('Grade must be a valid number')
    }
  }

  getValue(): number {
    return this.value
  }

  equals(other: Grade): boolean {
    return Math.abs(this.value - other.value) < 0.01
  }

  // Business rule: Check if grade is passing (>= 10)
  isPassing(): boolean {
    return this.value >= 10
  }

  // Business rule: Check if grade is failing (< 10)
  isFailing(): boolean {
    return this.value < 10
  }

  // Business rule: Check if grade is excellent (>= 16)
  isExcellent(): boolean {
    return this.value >= 16
  }

  // Business rule: Check if grade is good (>= 14)
  isGood(): boolean {
    return this.value >= 14
  }

  // Business rule: Check if grade is satisfactory (>= 12)
  isSatisfactory(): boolean {
    return this.value >= 12
  }

  // Business rule: Check if grade is barely passing (>= 10 && < 12)
  isBarelyPassing(): boolean {
    return this.value >= 10 && this.value < 12
  }

  // Business rule: Check if grade is very poor (< 5)
  isVeryPoor(): boolean {
    return this.value < 5
  }

  // Business rule: Get grade letter
  getGradeLetter(): string {
    if (this.value >= 18) return 'A+'
    if (this.value >= 16) return 'A'
    if (this.value >= 14) return 'B+'
    if (this.value >= 12) return 'B'
    if (this.value >= 10) return 'C'
    if (this.value >= 8) return 'D'
    return 'F'
  }

  // Business rule: Get grade status
  getGradeStatus(): 'excellent' | 'good' | 'satisfactory' | 'barely_passing' | 'poor' | 'very_poor' {
    if (this.isExcellent()) return 'excellent'
    if (this.isGood()) return 'good'
    if (this.isSatisfactory()) return 'satisfactory'
    if (this.isBarelyPassing()) return 'barely_passing'
    if (this.isVeryPoor()) return 'very_poor'
    return 'poor'
  }

  // Business rule: Get grade points (for GPA calculation)
  getGradePoints(): number {
    if (this.value >= 18) return 4.0
    if (this.value >= 16) return 3.7
    if (this.value >= 14) return 3.3
    if (this.value >= 12) return 3.0
    if (this.value >= 10) return 2.7
    if (this.value >= 8) return 2.0
    return 0.0
  }

  // Business rule: Get percentage score
  getPercentageScore(): number {
    return (this.value / 20) * 100
  }

  // Business rule: Get points needed to pass
  getPointsNeededToPass(): number {
    return Math.max(0, 10 - this.value)
  }

  // Business rule: Get points above passing
  getPointsAbovePassing(): number {
    return Math.max(0, this.value - 10)
  }

  // Business rule: Compare with another grade
  isHigherThan(other: Grade): boolean {
    return this.value > other.value
  }

  // Business rule: Compare with another grade
  isLowerThan(other: Grade): boolean {
    return this.value < other.value
  }

  // Business rule: Get distance from perfect score
  getDistanceFromPerfect(): number {
    return 20 - this.value
  }

  // Business rule: Get formatted display
  getDisplayFormat(): string {
    return `${this.value.toFixed(2)}/20`
  }

  // Business rule: Get formatted display with letter
  getDisplayWithLetter(): string {
    return `${this.value.toFixed(2)}/20 (${this.getGradeLetter()})`
  }
} 