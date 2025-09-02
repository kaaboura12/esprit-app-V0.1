import { HourlyRate, HourlyShiftType, RateType } from '@/core/entities/HourlyRate'

export interface HourlyRateDTO {
  id?: number
  shiftType: HourlyShiftType
  rateType: RateType
  rateAmount: number
  academicYear: string
  isActive: boolean
}

export interface CreateHourlyRateDTO {
  shiftType: HourlyShiftType
  rateType: RateType
  rateAmount: number
  academicYear: string
  isActive?: boolean
}

export interface UpdateHourlyRateDTO {
  id: number
  rateAmount?: number
  isActive?: boolean
}

export interface HourlyRateFilters {
  shiftType?: HourlyShiftType
  rateType?: RateType
  academicYear?: string
  isActive?: boolean
}
