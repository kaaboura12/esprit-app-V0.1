import { NextRequest, NextResponse } from 'next/server'
import { SupabaseHourlyRateRepository } from '@/infrastructure/repositories/HourlyRateRepository'
import { GetHourlyRatesUseCase } from '@/application/use-cases/GetHourlyRatesUseCase'
import { CreateHourlyRateUseCase } from '@/application/use-cases/CreateHourlyRateUseCase'
import { CreateHourlyRateDTO, HourlyRateFilters } from '@/application/dtos/HourlyRateDTO'

const hourlyRateRepository = new SupabaseHourlyRateRepository()
const getHourlyRatesUseCase = new GetHourlyRatesUseCase(hourlyRateRepository)
const createHourlyRateUseCase = new CreateHourlyRateUseCase(hourlyRateRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: HourlyRateFilters = {}
    
    if (searchParams.get('shiftType')) {
      filters.shiftType = searchParams.get('shiftType') as any
    }
    if (searchParams.get('rateType')) {
      filters.rateType = searchParams.get('rateType') as any
    }
    if (searchParams.get('academicYear')) {
      filters.academicYear = searchParams.get('academicYear')!
    }
    if (searchParams.get('isActive')) {
      filters.isActive = searchParams.get('isActive') === 'true'
    }

    const hourlyRates = await getHourlyRatesUseCase.execute(filters)
    
    return NextResponse.json(hourlyRates)
  } catch (error) {
    console.error('Error fetching hourly rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hourly rates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const createData: CreateHourlyRateDTO = {
      shiftType: body.shiftType,
      rateType: body.rateType,
      rateAmount: parseFloat(body.rateAmount),
      academicYear: body.academicYear,
      isActive: body.isActive ?? true
    }

    const hourlyRate = await createHourlyRateUseCase.execute(createData)
    
    return NextResponse.json(hourlyRate, { status: 201 })
  } catch (error) {
    console.error('Error creating hourly rate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create hourly rate' },
      { status: 400 }
    )
  }
}
