import { HourlyRateRepository } from '@/core/interfaces/HourlyRateRepository'
import { HourlyRate } from '@/core/entities/HourlyRate'
import { HourlyRateFilters } from '@/application/dtos/HourlyRateDTO'

export class GetHourlyRatesUseCase {
  constructor(private hourlyRateRepository: HourlyRateRepository) {}

  async execute(filters?: HourlyRateFilters): Promise<HourlyRate[]> {
    return await this.hourlyRateRepository.findAll(filters)
  }
}
