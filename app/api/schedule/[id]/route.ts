import { NextRequest, NextResponse } from 'next/server'
import { MySQLScheduleRepository } from '@/infrastructure/repositories/MySQLScheduleRepository'
import { GetSchedulesUseCase } from '@/application/use-cases/GetSchedulesUseCase'

const scheduleRepository = new MySQLScheduleRepository()
const getSchedulesUseCase = new GetSchedulesUseCase(scheduleRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 })
    }

    const schedule = await getSchedulesUseCase.getScheduleById(id)
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error in schedule by ID API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 