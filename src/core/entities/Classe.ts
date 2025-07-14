/**
 * Classe Entity - Domain layer
 * This represents a class/classroom with business rules
 */
export class Classe {
  constructor(
    private readonly id: number,
    private readonly nomClasse: string,
    private readonly bloc: string,
    private readonly numclasse: number,
    private readonly nbreEtudiantMax: number = 35,
    private readonly nbreEtudiantActuel: number = 0
  ) {
    this.validateClasse()
  }

  private validateClasse(): void {
    if (!this.nomClasse || this.nomClasse.trim().length === 0) {
      throw new Error('Class name cannot be empty')
    }

    if (this.nomClasse.length > 50) {
      throw new Error('Class name cannot exceed 50 characters')
    }

    if (!this.bloc || this.bloc.trim().length === 0) {
      throw new Error('Bloc cannot be empty')
    }

    if (this.bloc.length > 10) {
      throw new Error('Bloc cannot exceed 10 characters')
    }

    if (this.numclasse < 1) {
      throw new Error('Class number must be positive')
    }

    if (this.nbreEtudiantMax < 1 || this.nbreEtudiantMax > 100) {
      throw new Error('Maximum students must be between 1 and 100')
    }

    if (this.nbreEtudiantActuel < 0) {
      throw new Error('Current student count cannot be negative')
    }

    if (this.nbreEtudiantActuel > this.nbreEtudiantMax) {
      throw new Error('Current student count cannot exceed maximum capacity')
    }
  }

  getId(): number {
    return this.id
  }

  getNomClasse(): string {
    return this.nomClasse
  }

  getBloc(): string {
    return this.bloc
  }

  getNumclasse(): number {
    return this.numclasse
  }

  getNbreEtudiantMax(): number {
    return this.nbreEtudiantMax
  }

  getNbreEtudiantActuel(): number {
    return this.nbreEtudiantActuel
  }

  // Business rule: Check if class is full
  isFull(): boolean {
    return this.nbreEtudiantActuel >= this.nbreEtudiantMax
  }

  // Business rule: Check if class is nearly full (> 90% capacity)
  isNearlyFull(): boolean {
    return this.nbreEtudiantActuel >= (this.nbreEtudiantMax * 0.9)
  }

  // Business rule: Check if class is empty
  isEmpty(): boolean {
    return this.nbreEtudiantActuel === 0
  }

  // Business rule: Get available spots
  getAvailableSpots(): number {
    return this.nbreEtudiantMax - this.nbreEtudiantActuel
  }

  // Business rule: Get capacity percentage
  getCapacityPercentage(): number {
    return Math.round((this.nbreEtudiantActuel / this.nbreEtudiantMax) * 100)
  }

  // Business rule: Check if can add student
  canAddStudent(): boolean {
    return this.nbreEtudiantActuel < this.nbreEtudiantMax
  }

  // Business rule: Check if can add multiple students
  canAddStudents(count: number): boolean {
    return (this.nbreEtudiantActuel + count) <= this.nbreEtudiantMax
  }

  // Business rule: Get full class identifier
  getFullIdentifier(): string {
    return `${this.nomClasse}-${this.numclasse} (${this.bloc})`
  }

  // Business rule: Get class level from name
  getClassLevel(): string {
    const levelPattern = /(\d+)[a-zA-Z]*/
    const match = this.nomClasse.match(levelPattern)
    return match ? match[1] : 'Unknown'
  }

  // Business rule: Check if class is undergraduate
  isUndergraduate(): boolean {
    const level = parseInt(this.getClassLevel())
    return level >= 1 && level <= 3
  }

  // Business rule: Check if class is graduate
  isGraduate(): boolean {
    const level = parseInt(this.getClassLevel())
    return level >= 4 && level <= 5
  }

  // Business rule: Get class status
  getStatus(): 'empty' | 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.getCapacityPercentage()
    if (percentage === 0) return 'empty'
    if (percentage < 30) return 'low'
    if (percentage < 70) return 'medium'
    if (percentage < 100) return 'high'
    return 'full'
  }

  // Factory method for creating a class
  static create(
    id: number,
    nomClasse: string,
    bloc: string,
    numclasse: number,
    nbreEtudiantMax: number = 35,
    nbreEtudiantActuel: number = 0
  ): Classe {
    return new Classe(id, nomClasse, bloc, numclasse, nbreEtudiantMax, nbreEtudiantActuel)
  }

  // Factory method to create updated class with new student count
  withStudentCount(nbreEtudiantActuel: number): Classe {
    return new Classe(
      this.id,
      this.nomClasse,
      this.bloc,
      this.numclasse,
      this.nbreEtudiantMax,
      nbreEtudiantActuel
    )
  }

  // Factory method to create updated class with new capacity
  withCapacity(nbreEtudiantMax: number): Classe {
    return new Classe(
      this.id,
      this.nomClasse,
      this.bloc,
      this.numclasse,
      nbreEtudiantMax,
      this.nbreEtudiantActuel
    )
  }
} 