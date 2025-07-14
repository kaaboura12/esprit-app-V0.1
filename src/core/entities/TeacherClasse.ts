/**
 * TeacherClasse Entity - Domain layer
 * This represents the association between teachers, classes, and subjects
 */
export class TeacherClasse {
  constructor(
    private readonly id: number,
    private readonly teacherId: number,
    private readonly classeId: number,
    private readonly matiereId: number
  ) {
    this.validateTeacherClasse()
  }

  private validateTeacherClasse(): void {
    if (this.teacherId <= 0) {
      throw new Error('Teacher ID must be positive')
    }

    if (this.classeId <= 0) {
      throw new Error('Class ID must be positive')
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

  getClasseId(): number {
    return this.classeId
  }

  getMatiereId(): number {
    return this.matiereId
  }

  // Business rule: Check if this is a valid teaching assignment
  isValidAssignment(): boolean {
    return this.teacherId > 0 && this.classeId > 0 && this.matiereId > 0
  }

  // Business rule: Get unique identifier for this assignment
  getAssignmentKey(): string {
    return `teacher_${this.teacherId}_classe_${this.classeId}_matiere_${this.matiereId}`
  }

  // Business rule: Check if assignment matches given teacher, class, and subject
  matches(teacherId: number, classeId: number, matiereId: number): boolean {
    return this.teacherId === teacherId && 
           this.classeId === classeId && 
           this.matiereId === matiereId
  }

  // Business rule: Check if assignment involves given teacher
  involvesTeacher(teacherId: number): boolean {
    return this.teacherId === teacherId
  }

  // Business rule: Check if assignment involves given class
  involvesClass(classeId: number): boolean {
    return this.classeId === classeId
  }

  // Business rule: Check if assignment involves given subject
  involvesSubject(matiereId: number): boolean {
    return this.matiereId === matiereId
  }

  // Business rule: Check if assignment involves given teacher and class
  involvesTeacherAndClass(teacherId: number, classeId: number): boolean {
    return this.teacherId === teacherId && this.classeId === classeId
  }

  // Business rule: Check if assignment involves given teacher and subject
  involvesTeacherAndSubject(teacherId: number, matiereId: number): boolean {
    return this.teacherId === teacherId && this.matiereId === matiereId
  }

  // Business rule: Check if assignment involves given class and subject
  involvesClassAndSubject(classeId: number, matiereId: number): boolean {
    return this.classeId === classeId && this.matiereId === matiereId
  }

  // Business rule: Get teaching context identifier
  getTeachingContext(): string {
    return `T${this.teacherId}_C${this.classeId}_M${this.matiereId}`
  }

  // Business rule: Check if this is a complete teaching assignment
  isCompleteAssignment(): boolean {
    return this.isValidAssignment()
  }

  // Business rule: Check if assignment can be scheduled
  canBeScheduled(): boolean {
    return this.isValidAssignment()
  }

  // Factory method for creating a teacher-class-subject assignment
  static create(
    id: number,
    teacherId: number,
    classeId: number,
    matiereId: number
  ): TeacherClasse {
    return new TeacherClasse(id, teacherId, classeId, matiereId)
  }

  // Factory method to create assignment with different teacher
  withTeacher(teacherId: number): TeacherClasse {
    return new TeacherClasse(this.id, teacherId, this.classeId, this.matiereId)
  }

  // Factory method to create assignment with different class
  withClass(classeId: number): TeacherClasse {
    return new TeacherClasse(this.id, this.teacherId, classeId, this.matiereId)
  }

  // Factory method to create assignment with different subject
  withSubject(matiereId: number): TeacherClasse {
    return new TeacherClasse(this.id, this.teacherId, this.classeId, matiereId)
  }
} 