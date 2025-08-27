export interface TeacherWorkload {
  id?: number;
  teacherId: number;
  matiereId: number;
  classeId: number;
  shiftType: ShiftType;
  period: Period;
  hours: number;
  academicYear: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ShiftType {
  COURS_DE_JOUR = 'cours_de_jour',
  ALTERNANCE = 'alternance',
  COURS_DE_SOIR = 'cours_de_soir'
}

export enum Period {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4'
}

export class TeacherWorkloadEntity implements TeacherWorkload {
  id?: number;
  teacherId: number;
  matiereId: number;
  classeId: number;
  shiftType: ShiftType;
  period: Period;
  hours: number;
  academicYear: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: TeacherWorkload) {
    this.id = data.id;
    this.teacherId = data.teacherId;
    this.matiereId = data.matiereId;
    this.classeId = data.classeId;
    this.shiftType = data.shiftType;
    this.period = data.period;
    this.hours = data.hours;
    this.academicYear = data.academicYear;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Validation methods
  validate(): boolean {
    return (
      this.teacherId > 0 &&
      this.matiereId > 0 &&
      this.classeId > 0 &&
      this.hours >= 0 &&
      this.academicYear.length === 9 &&
      this.academicYear.includes('-')
    );
  }

  // Business logic methods
  isDayCourse(): boolean {
    return this.shiftType === ShiftType.COURS_DE_JOUR;
  }

  isAlternance(): boolean {
    return this.shiftType === ShiftType.ALTERNANCE;
  }

  isEveningCourse(): boolean {
    return this.shiftType === ShiftType.COURS_DE_SOIR;
  }

  // Get semester based on period
  getSemester(): number {
    switch (this.period) {
      case Period.P1:
      case Period.P2:
        return 1;
      case Period.P3:
      case Period.P4:
        return 2;
      default:
        return 1;
    }
  }

  // Convert to plain object
  toJSON(): TeacherWorkload {
    return {
      id: this.id,
      teacherId: this.teacherId,
      matiereId: this.matiereId,
      classeId: this.classeId,
      shiftType: this.shiftType,
      period: this.period,
      hours: this.hours,
      academicYear: this.academicYear,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
