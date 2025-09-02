import { NextRequest, NextResponse } from 'next/server'
import { SupabaseHourlyRateRepository } from '@/infrastructure/repositories/HourlyRateRepository'
import { UpdateHourlyRateUseCase } from '@/application/use-cases/UpdateHourlyRateUseCase'
import { DeleteHourlyRateUseCase } from '@/application/use-cases/DeleteHourlyRateUseCase'
import { UpdateHourlyRateDTO } from '@/application/dtos/HourlyRateDTO'

const hourlyRateRepository = new SupabaseHourlyRateRepository()
const updateHourlyRateUseCase = new UpdateHourlyRateUseCase(hourlyRateRepository)
const deleteHourlyRateUseCase = new DeleteHourlyRateUseCase(hourlyRateRepository)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const updateData: UpdateHourlyRateDTO = {
      id,
      rateAmount: body.rateAmount ? parseFloat(body.rateAmount) : undefined,
      isActive: body.isActive
    }

    const hourlyRate = await updateHourlyRateUseCase.execute(updateData)
    
    return NextResponse.json(hourlyRate)
  } catch (error) {
    console.error('Error updating hourly rate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update hourly rate' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    await deleteHourlyRateUseCase.execute(id)
    
    return NextResponse.json({ message: 'Hourly rate deleted successfully' })
  } catch (error) {
    console.error('Error deleting hourly rate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete hourly rate' },
      { status: 400 }
    )
  }
}
