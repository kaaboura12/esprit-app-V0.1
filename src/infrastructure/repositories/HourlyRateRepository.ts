import { supabase } from '../config/supabaseClient'
import { HourlyRateRepository } from '@/core/interfaces/HourlyRateRepository'
import { HourlyRate } from '@/core/entities/HourlyRate'
import { CreateHourlyRateDTO, UpdateHourlyRateDTO, HourlyRateFilters } from '@/application/dtos/HourlyRateDTO'

export class SupabaseHourlyRateRepository implements HourlyRateRepository {
  async findAll(filters?: HourlyRateFilters): Promise<HourlyRate[]> {
    let query = supabase
      .from('hourly_rates')
      .select('*')
      .order('shift_type', { ascending: true })
      .order('rate_type', { ascending: true })

    if (filters) {
      if (filters.shiftType) {
        query = query.eq('shift_type', filters.shiftType)
      }
      if (filters.rateType) {
        query = query.eq('rate_type', filters.rateType)
      }
      if (filters.academicYear) {
        query = query.eq('academic_year', filters.academicYear)
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch hourly rates: ${error.message}`)
    }

    return data?.map(this.mapToEntity) || []
  }

  async findById(id: number): Promise<HourlyRate | null> {
    const { data, error } = await supabase
      .from('hourly_rates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch hourly rate: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByShiftAndRateType(shiftType: string, rateType: string, academicYear: string): Promise<HourlyRate | null> {
    const { data, error } = await supabase
      .from('hourly_rates')
      .select('*')
      .eq('shift_type', shiftType)
      .eq('rate_type', rateType)
      .eq('academic_year', academicYear)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch hourly rate: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async create(data: CreateHourlyRateDTO): Promise<HourlyRate> {
    const { data: result, error } = await supabase
      .from('hourly_rates')
      .insert({
        shift_type: data.shiftType,
        rate_type: data.rateType,
        rate_amount: data.rateAmount,
        academic_year: data.academicYear,
        is_active: data.isActive ?? true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create hourly rate: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async update(data: UpdateHourlyRateDTO): Promise<HourlyRate> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (data.rateAmount !== undefined) {
      updateData.rate_amount = data.rateAmount
    }
    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive
    }

    const { data: result, error } = await supabase
      .from('hourly_rates')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update hourly rate: ${error.message}`)
    }

    return this.mapToEntity(result)
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('hourly_rates')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete hourly rate: ${error.message}`)
    }
  }

  async getCurrentAcademicYear(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('year')
        .eq('is_current', true)
        .single()

      if (error) {
        // If academic_years table doesn't exist, fallback to current year
        console.warn('Academic years table not found, using current year as fallback')
        return this.getCurrentYearString()
      }

      return data?.year || this.getCurrentYearString()
    } catch (error) {
      // Fallback to current year if any error occurs
      console.warn('Error fetching academic year, using current year as fallback:', error)
      return this.getCurrentYearString()
    }
  }

  private getCurrentYearString(): string {
    const currentYear = new Date().getFullYear()
    return `${currentYear}-${currentYear + 1}`
  }

  private mapToEntity(data: any): HourlyRate {
    return {
      id: data.id,
      shiftType: data.shift_type,
      rateType: data.rate_type,
      rateAmount: parseFloat(data.rate_amount),
      academicYear: data.academic_year,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}
