/**
 * TeacherMatiere Entity - Domain layer
 * This represents the association between teachers and subjects
 */
export class TeacherMatiere {
  constructor(
    private readonly id: number,
    private readonly teacherId: number,
    private readonly matiereId: number
  ) {
    this.validateTeacherMatiere()
  }

  private validateTeacherMatiere(): void {
    if (this.teacherId <= 0) {
      throw new Error('Teacher ID must be positive')
    }

    if (this.matiereId <= 0) {
      throw new Error('Subject ID must be positive')
    }
  }

  getId(): number {
    return this.id
  }

  getTeacherId(): number {
    return this.teacherId
  }

  getMatiereId(): number {
    return this.matiereId
  }

  // Business rule: Check if this is a valid assignment
  isValidAssignment(): boolean {
    return this.teacherId > 0 && this.matiereId > 0
  }

  // Business rule: Get unique identifier for this assignment
  getAssignmentKey(): string {
    return `teacher_${this.teacherId}_matiere_${this.matiereId}`
  }

  // Business rule: Check if assignment matches given teacher and subject
  matches(teacherId: number, matiereId: number): boolean {
    return this.teacherId === teacherId && this.matiereId === matiereId
  }

  // Business rule: Check if assignment involves given teacher
  involvesTeacher(teacherId: number): boolean {
    return this.teacherId === teacherId
  }

  // Business rule: Check if assignment involves given subject
  involvesSubject(matiereId: number): boolean {
    return this.matiereId === matiereId
  }

  // Factory method for creating a teacher-subject assignment
  static create(
    id: number,
    teacherId: number,
    matiereId: number
  ): TeacherMatiere {
    return new TeacherMatiere(id, teacherId, matiereId)
  }

  // Factory method to create assignment with different teacher
  withTeacher(teacherId: number): TeacherMatiere {
    return new TeacherMatiere(this.id, teacherId, this.matiereId)
  }

  // Factory method to create assignment with different subject
  withSubject(matiereId: number): TeacherMatiere {
    return new TeacherMatiere(this.id, this.teacherId, matiereId)
  }
} 