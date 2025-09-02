import { HourlyRateRepository } from '@/core/interfaces/HourlyRateRepository'
import { HourlyRate } from '@/core/entities/HourlyRate'
import { CreateHourlyRateDTO } from '@/application/dtos/HourlyRateDTO'

export class CreateHourlyRateUseCase {
  constructor(private hourlyRateRepository: HourlyRateRepository) {}

  async execute(data: CreateHourlyRateDTO): Promise<HourlyRate> {
    // Check if a rate already exists for this combination
    const existingRate = await this.hourlyRateRepository.findByShiftAndRateType(
      data.shiftType,
      data.rateType,
      data.academicYear
    )

    if (existingRate) {
      throw new Error('Un tarif existe déjà pour cette combinaison de type de poste, type de tarif et année académique')
    }

    return await this.hourlyRateRepository.create(data)
  }
}
