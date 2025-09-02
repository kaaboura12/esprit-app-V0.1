import { HourlyRateRepository } from '@/core/interfaces/HourlyRateRepository'

export class DeleteHourlyRateUseCase {
  constructor(private hourlyRateRepository: HourlyRateRepository) {}

  async execute(id: number): Promise<void> {
    // Check if the rate exists
    const existingRate = await this.hourlyRateRepository.findById(id)
    if (!existingRate) {
      throw new Error('Tarif horaire non trouvé')
    }

    await this.hourlyRateRepository.delete(id)
  }
}
