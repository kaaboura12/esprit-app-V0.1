/**
 * NoteConfig Entity - Domain layer
 * This represents the configuration of note percentages for a subject
 */
export class NoteConfig {
  constructor(
    private readonly id: number,
    private readonly matiereId: number,
    private readonly pourcentageCC: number = 0.00,
    private readonly pourcentageTP: number = 0.00,
    private readonly pourcentageDV: number = 0.00
  ) {
    this.validatePercentages()
  }

  private validatePercentages(): void {
    if (this.matiereId <= 0) {
      throw new Error('Subject ID must be positive')
    }

    if (this.pourcentageCC < 0 || this.pourcentageCC > 100) {
      throw new Error('CC percentage must be between 0 and 100')
    }

    if (this.pourcentageTP < 0 || this.pourcentageTP > 100) {
      throw new Error('TP percentage must be between 0 and 100')
    }

    if (this.pourcentageDV < 0 || this.pourcentageDV > 100) {
      throw new Error('DV percentage must be between 0 and 100')
    }

    const total = this.pourcentageCC + this.pourcentageTP + this.pourcentageDV
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(`Total percentage must equal 100, got ${total}`)
    }
  }

  // Getters
  getId(): number {
    return this.id
  }

  getMatiereId(): number {
    return this.matiereId
  }

  getPourcentageCC(): number {
    return this.pourcentageCC
  }

  getPourcentageTP(): number {
    return this.pourcentageTP
  }

  getPourcentageDV(): number {
    return this.pourcentageDV
  }

  // Business rules
  hasTPComponent(): boolean {
    return this.pourcentageTP > 0
  }

  // Business rule: Check if CC is the main component
  isCCMainComponent(): boolean {
    return this.pourcentageCC > this.pourcentageTP && this.pourcentageCC > this.pourcentageDV
  }

  // Business rule: Check if DV is the main component
  isDVMainComponent(): boolean {
    return this.pourcentageDV > this.pourcentageCC && this.pourcentageDV > this.pourcentageTP
  }

  // Business rule: Get the dominant component
  getDominantComponent(): 'CC' | 'TP' | 'DV' | 'balanced' {
    const max = Math.max(this.pourcentageCC, this.pourcentageTP, this.pourcentageDV)
    
    if (this.pourcentageCC === max && this.pourcentageCC > 40) return 'CC'
    if (this.pourcentageTP === max && this.pourcentageTP > 40) return 'TP'
    if (this.pourcentageDV === max && this.pourcentageDV > 40) return 'DV'
    
    return 'balanced'
  }

  // Business rule: Calculate final grade
  calculateFinalGrade(noteCC: number | null, noteTP: number | null, noteDV: number | null): number | null {
    // Check if all required components are present
    if (noteCC === null || noteDV === null) return null
    if (this.hasTPComponent() && noteTP === null) return null

    let finalGrade = 0
    finalGrade += (noteCC * this.pourcentageCC) / 100
    finalGrade += (noteDV * this.pourcentageDV) / 100
    
    if (this.hasTPComponent() && noteTP !== null) {
      finalGrade += (noteTP * this.pourcentageTP) / 100
    }

    return Math.round(finalGrade * 100) / 100 // Round to 2 decimal places
  }

  // Factory method to create new config
  static create(
    matiereId: number,
    pourcentageCC: number,
    pourcentageTP: number,
    pourcentageDV: number
  ): NoteConfig {
    return new NoteConfig(0, matiereId, pourcentageCC, pourcentageTP, pourcentageDV)
  }

  // Factory method to create standard config (no TP)
  static createStandard(matiereId: number, ccPercentage: number = 40): NoteConfig {
    return new NoteConfig(0, matiereId, ccPercentage, 0, 100 - ccPercentage)
  }

  // Factory method to create config with TP
  static createWithTP(
    matiereId: number, 
    ccPercentage: number = 30, 
    tpPercentage: number = 30
  ): NoteConfig {
    return new NoteConfig(0, matiereId, ccPercentage, tpPercentage, 100 - ccPercentage - tpPercentage)
  }
} 
