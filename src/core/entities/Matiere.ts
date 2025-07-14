/**
 * Matiere (Subject) Entity - Domain layer
 * This represents a subject/course with business rules
 */
export class Matiere {
  constructor(
    private readonly id: number,
    private readonly nommatiere: string,
    private readonly description: string | null,
    private readonly coefficient: number = 1.00
  ) {
    this.validateMatiere()
  }

  private validateMatiere(): void {
    if (!this.nommatiere || this.nommatiere.trim().length === 0) {
      throw new Error('Subject name cannot be empty')
    }

    if (this.nommatiere.length > 100) {
      throw new Error('Subject name cannot exceed 100 characters')
    }

    if (this.coefficient < 0.1 || this.coefficient > 10.0) {
      throw new Error('Coefficient must be between 0.1 and 10.0')
    }

    if (this.description && this.description.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters')
    }
  }

  getId(): number {
    return this.id
  }

  getNommatiere(): string {
    return this.nommatiere
  }

  getDescription(): string | null {
    return this.description
  }

  getCoefficient(): number {
    return this.coefficient
  }

  // Business rule: Check if subject has description
  hasDescription(): boolean {
    return this.description !== null && this.description.trim().length > 0
  }

  // Business rule: Check if subject is high priority (coefficient > 2)
  isHighPriority(): boolean {
    return this.coefficient > 2.0
  }

  // Business rule: Check if subject is practical (contains TP, Lab, etc.)
  isPracticalSubject(): boolean {
    const practicalKeywords = ['tp', 'lab', 'pratique', 'atelier', 'projet']
    return practicalKeywords.some(keyword => 
      this.nommatiere.toLowerCase().includes(keyword)
    )
  }

  // Business rule: Get subject type based on name
  getSubjectType(): 'theoretical' | 'practical' | 'mixed' {
    const theoreticalKeywords = ['cours', 'théorie', 'fondamental']
    const practicalKeywords = ['tp', 'lab', 'pratique', 'atelier']
    
    const isTheoretical = theoreticalKeywords.some(keyword => 
      this.nommatiere.toLowerCase().includes(keyword)
    )
    const isPractical = practicalKeywords.some(keyword => 
      this.nommatiere.toLowerCase().includes(keyword)
    )

    if (isTheoretical && isPractical) return 'mixed'
    if (isPractical) return 'practical'
    return 'theoretical'
  }

  // Business rule: Calculate weighted importance
  getWeightedImportance(): number {
    return this.coefficient * (this.isHighPriority() ? 1.5 : 1.0)
  }

  // Factory method for creating a subject
  static create(
    id: number,
    nommatiere: string,
    description?: string,
    coefficient: number = 1.00
  ): Matiere {
    return new Matiere(id, nommatiere, description || null, coefficient)
  }

  // Factory method to create updated subject with new coefficient
  withCoefficient(coefficient: number): Matiere {
    return new Matiere(this.id, this.nommatiere, this.description, coefficient)
  }

  // Factory method to create updated subject with new description
  withDescription(description: string): Matiere {
    return new Matiere(this.id, this.nommatiere, description, this.coefficient)
  }
} 