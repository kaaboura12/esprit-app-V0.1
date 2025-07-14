/**
 * NoteFinale Entity - Domain layer
 * This represents a student's final grade for a subject with business rules
 */
export class NoteFinale {
  constructor(
    private readonly id: number,
    private readonly etudiantId: number,
    private readonly matiereId: number,
    private readonly teacherId: number,
    private readonly noteCC: number | null = null,
    private readonly noteTP: number | null = null,
    private readonly noteDV: number | null = null,
    private readonly noteFinale: number | null = null
  ) {
    this.validateNotes()
  }

  // Getters
  getId(): number {
    return this.id
  }

  getEtudiantId(): number {
    return this.etudiantId
  }

  getMatiereId(): number {
    return this.matiereId
  }

  getTeacherId(): number {
    return this.teacherId
  }

  getNoteCC(): number | null {
    return this.noteCC
  }

  getNoteTP(): number | null {
    return this.noteTP
  }

  getNoteDV(): number | null {
    return this.noteDV
  }

  getNoteFinale(): number | null {
    return this.noteFinale
  }

  // Business rules
  private validateNotes(): void {
    this.validateNote(this.noteCC, 'CC')
    this.validateNote(this.noteTP, 'TP')
    this.validateNote(this.noteDV, 'DV')
    this.validateNote(this.noteFinale, 'Finale')
  }

  private validateNote(note: number | null, type: string): void {
    if (note !== null && (note < 0 || note > 20)) {
      throw new Error(`Note ${type} must be between 0 and 20, got ${note}`)
    }
  }

  // Business rule: Check if student passed (note >= 10)
  isPassed(): boolean {
    return this.noteFinale !== null && this.noteFinale >= 10
  }

  // Business rule: Check if all required notes are present
  hasAllRequiredNotes(hasTP: boolean): boolean {
    const hasCC = this.noteCC !== null
    const hasDV = this.noteDV !== null
    const hasTPNote = hasTP ? this.noteTP !== null : true
    
    return hasCC && hasDV && hasTPNote
  }

  // Business rule: Get grade letter
  getGradeLetter(): string {
    if (this.noteFinale === null) return 'N/A'
    
    if (this.noteFinale >= 16) return 'A'
    if (this.noteFinale >= 14) return 'B'
    if (this.noteFinale >= 12) return 'C'
    if (this.noteFinale >= 10) return 'D'
    return 'F'
  }

  // Business rule: Get completion percentage
  getCompletionPercentage(hasTP: boolean): number {
    let completed = 0
    let total = hasTP ? 3 : 2
    
    if (this.noteCC !== null) completed++
    if (this.noteDV !== null) completed++
    if (hasTP && this.noteTP !== null) completed++
    
    return Math.round((completed / total) * 100)
  }

  // Factory method to create new note
  static create(
    etudiantId: number,
    matiereId: number,
    teacherId: number,
    noteCC: number | null = null,
    noteTP: number | null = null,
    noteDV: number | null = null
  ): NoteFinale {
    return new NoteFinale(
      0, // ID will be set by database
      etudiantId,
      matiereId,
      teacherId,
      noteCC,
      noteTP,
      noteDV,
      null // Final grade will be calculated
    )
  }

  // Create updated version with new notes
  withUpdatedNotes(
    noteCC: number | null,
    noteTP: number | null,
    noteDV: number | null
  ): NoteFinale {
    return new NoteFinale(
      this.id,
      this.etudiantId,
      this.matiereId,
      this.teacherId,
      noteCC,
      noteTP,
      noteDV,
      this.noteFinale // Will be recalculated by database trigger
    )
  }
} 