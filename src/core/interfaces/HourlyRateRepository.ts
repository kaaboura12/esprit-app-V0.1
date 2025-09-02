import { HourlyRate } from '../entities/HourlyRate'
import { CreateHourlyRateDTO, UpdateHourlyRateDTO, HourlyRateFilters } from '@/application/dtos/HourlyRateDTO'

export interface HourlyRateRepository {
  findAll(filters?: HourlyRateFilters): Promise<HourlyRate[]>
  findById(id: number): Promise<HourlyRate | null>
  findByShiftAndRateType(shiftType: string, rateType: string, academicYear: string): Promise<HourlyRate | null>
  create(data: CreateHourlyRateDTO): Promise<HourlyRate>
  update(data: UpdateHourlyRateDTO): Promise<HourlyRate>
  delete(id: number): Promise<void>
  getCurrentAcademicYear(): Promise<string>
}
