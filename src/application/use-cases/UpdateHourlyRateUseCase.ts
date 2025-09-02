import { HourlyRateRepository } from '@/core/interfaces/HourlyRateRepository'
import { HourlyRate } from '@/core/entities/HourlyRate'
import { UpdateHourlyRateDTO } from '@/application/dtos/HourlyRateDTO'

export class UpdateHourlyRateUseCase {
  constructor(private hourlyRateRepository: HourlyRateRepository) {}

  async execute(data: UpdateHourlyRateDTO): Promise<HourlyRate> {
    // Check if the rate exists
    const existingRate = await this.hourlyRateRepository.findById(data.id)
    if (!existingRate) {
      throw new Error('Tarif horaire non trouvé')
    }

    return await this.hourlyRateRepository.update(data)
  }
}
