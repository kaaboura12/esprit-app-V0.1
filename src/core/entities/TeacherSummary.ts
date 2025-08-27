import { ShiftType } from './TeacherWorkload';

export interface TeacherSummary {
  id?: number;
  teacherId: number;
  shiftType: ShiftType;
  academicYear: string;
  
  // Hours per period
  hoursP1: number;
  hoursP2: number;
  hoursP3: number;
  hoursP4: number;
  
  // Semester totals
  hoursSemester1: number; // P1 + P2
  hoursSemester2: number; // P3 + P4
  
  // Total volume horaire
  totalVolumeHoraire: number; // P1 + P2 + P3 + P4
  
  // Créneaux calculations (only for cours_de_jour)
  creneauxSemester1: number; // hours_semester_1 / 42
  creneauxSemester2: number; // hours_semester_2 / 42
  
  // Extra hours and payment calculations
  heuresSupplementaires: number;
  
  // Special fields for alternance
  hoursSamedi: number; // Only for alternance
  
  // Payment calculations
  montantTotal: number;
  
  updatedAt?: Date;
}

export class TeacherSummaryEntity implements TeacherSummary {
  id?: number;
  teacherId: number;
  shiftType: ShiftType;
  academicYear: string;
  
  // Hours per period
  hoursP1: number;
  hoursP2: number;
  hoursP3: number;
  hoursP4: number;
  
  // Semester totals
  hoursSemester1: number;
  hoursSemester2: number;
  
  // Total volume horaire
  totalVolumeHoraire: number;
  
  // Créneaux calculations
  creneauxSemester1: number;
  creneauxSemester2: number;
  
  // Extra hours and payment calculations
  heuresSupplementaires: number;
  
  // Special fields for alternance
  hoursSamedi: number;
  
  // Payment calculations
  montantTotal: number;
  
  updatedAt?: Date;

  constructor(data: TeacherSummary) {
    this.id = data.id;
    this.teacherId = data.teacherId;
    this.shiftType = data.shiftType;
    this.academicYear = data.academicYear;
    this.hoursP1 = data.hoursP1;
    this.hoursP2 = data.hoursP2;
    this.hoursP3 = data.hoursP3;
    this.hoursP4 = data.hoursP4;
    this.hoursSemester1 = data.hoursSemester1;
    this.hoursSemester2 = data.hoursSemester2;
    this.totalVolumeHoraire = data.totalVolumeHoraire;
    this.creneauxSemester1 = data.creneauxSemester1;
    this.creneauxSemester2 = data.creneauxSemester2;
    this.heuresSupplementaires = data.heuresSupplementaires;
    this.hoursSamedi = data.hoursSamedi;
    this.montantTotal = data.montantTotal;
    this.updatedAt = data.updatedAt;
  }

  // Validation methods
  validate(): boolean {
    return (
      this.teacherId > 0 &&
      this.academicYear.length === 9 &&
      this.academicYear.includes('-') &&
      this.hoursP1 >= 0 &&
      this.hoursP2 >= 0 &&
      this.hoursP3 >= 0 &&
      this.hoursP4 >= 0 &&
      this.hoursSemester1 >= 0 &&
      this.hoursSemester2 >= 0 &&
      this.totalVolumeHoraire >= 0 &&
      this.creneauxSemester1 >= 0 &&
      this.creneauxSemester2 >= 0 &&
      this.heuresSupplementaires >= 0 &&
      this.hoursSamedi >= 0 &&
      this.montantTotal >= 0
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

  // Check if créneaux limits are exceeded (only for cours_de_jour)
  isCreneauxLimitExceeded(): boolean {
    if (!this.isDayCourse()) return false;
    return this.creneauxSemester1 > 9 || this.creneauxSemester2 > 9;
  }

  // Get total hours for a specific semester
  getSemesterHours(semester: number): number {
    return semester === 1 ? this.hoursSemester1 : this.hoursSemester2;
  }

  // Get créneaux for a specific semester
  getCreneaux(semester: number): number {
    return semester === 1 ? this.creneauxSemester1 : this.creneauxSemester2;
  }

  // Calculate payment rate based on shift type
  getPaymentRate(): number {
    switch (this.shiftType) {
      case ShiftType.COURS_DE_JOUR:
        return 21; // Base rate for day courses
      case ShiftType.ALTERNANCE:
        return this.hoursSamedi > 0 ? 30 : 21; // Higher rate for Saturday classes
      case ShiftType.COURS_DE_SOIR:
        return 30; // Higher rate for evening classes
      default:
        return 21;
    }
  }

  // Check if teacher has supplementary hours
  hasSupplementaryHours(): boolean {
    return this.heuresSupplementaires > 0;
  }

  // Get total hours excluding supplementary hours
  getBaseHours(): number {
    if (this.isDayCourse()) {
      return Math.min(this.totalVolumeHoraire, 378); // 378 is the base limit
    }
    return this.totalVolumeHoraire;
  }

  // Convert to plain object
  toJSON(): TeacherSummary {
    return {
      id: this.id,
      teacherId: this.teacherId,
      shiftType: this.shiftType,
      academicYear: this.academicYear,
      hoursP1: this.hoursP1,
      hoursP2: this.hoursP2,
      hoursP3: this.hoursP3,
      hoursP4: this.hoursP4,
      hoursSemester1: this.hoursSemester1,
      hoursSemester2: this.hoursSemester2,
      totalVolumeHoraire: this.totalVolumeHoraire,
      creneauxSemester1: this.creneauxSemester1,
      creneauxSemester2: this.creneauxSemester2,
      heuresSupplementaires: this.heuresSupplementaires,
      hoursSamedi: this.hoursSamedi,
      montantTotal: this.montantTotal,
      updatedAt: this.updatedAt
    };
  }
}
