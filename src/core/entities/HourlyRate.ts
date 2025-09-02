export interface HourlyRate {
  id: number
  shiftType: 'cours_de_jour' | 'alternance' | 'cours_de_soir'
  rateType: 'heures_supp' | 'regular' | 'samedi' | 'soir'
  rateAmount: number
  academicYear: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type HourlyShiftType = 'cours_de_jour' | 'alternance' | 'cours_de_soir'
export type RateType = 'heures_supp' | 'regular' | 'samedi' | 'soir'
