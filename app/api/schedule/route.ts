import { NextRequest, NextResponse } from 'next/server'
import { MySQLScheduleRepository } from '@/infrastructure/repositories/MySQLScheduleRepository'
import { GetSchedulesUseCase } from '@/application/use-cases/GetSchedulesUseCase'
import { Schedule } from '@/core/entities/Schedule'

const scheduleRepository = new MySQLScheduleRepository()
const getSchedulesUseCase = new GetSchedulesUseCase(scheduleRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const weekStart = searchParams.get('weekStart')
    const date = searchParams.get('date')
    const teacherId = searchParams.get('teacherId')
    const classeId = searchParams.get('classeId')
    const matiereId = searchParams.get('matiereId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // console.log('Schedule API called with params:', { type, weekStart, teacherId, date, classeId, matiereId })

    let schedules

    switch (type) {
      case 'week':
        if (!weekStart) {
          return NextResponse.json({ error: 'weekStart parameter is required' }, { status: 400 })
        }
        if (teacherId) {
          const parsedWeekTeacherId = parseInt(teacherId)
          if (isNaN(parsedWeekTeacherId)) {
            return NextResponse.json({ error: 'Invalid teacherId parameter' }, { status: 400 })
          }
          schedules = await getSchedulesUseCase.getSchedulesByTeacher(
            parsedWeekTeacherId,
            new Date(weekStart),
            new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000)
          )
        } else {
          schedules = await getSchedulesUseCase.getSchedulesByWeek(new Date(weekStart))
        }
        break

      case 'date':
        if (!date) {
          return NextResponse.json({ error: 'date parameter is required' }, { status: 400 })
        }
        schedules = await getSchedulesUseCase.getSchedulesByDate(new Date(date))
        break

      case 'teacher':
        if (!teacherId) {
          return NextResponse.json({ error: 'teacherId parameter is required' }, { status: 400 })
        }
        const parsedTeacherTeacherId = parseInt(teacherId)
        if (isNaN(parsedTeacherTeacherId)) {
          return NextResponse.json({ error: 'Invalid teacherId parameter' }, { status: 400 })
        }
        schedules = await getSchedulesUseCase.getSchedulesByTeacher(
          parsedTeacherTeacherId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        break

      case 'class':
        if (!classeId) {
          return NextResponse.json({ error: 'classeId parameter is required' }, { status: 400 })
        }
        const parsedClasseId = parseInt(classeId)
        if (isNaN(parsedClasseId)) {
          return NextResponse.json({ error: 'Invalid classeId parameter' }, { status: 400 })
        }
        schedules = await getSchedulesUseCase.getSchedulesByClass(
          parsedClasseId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        break

      case 'subject':
        if (!matiereId) {
          return NextResponse.json({ error: 'matiereId parameter is required' }, { status: 400 })
        }
        const parsedMatiereId = parseInt(matiereId)
        if (isNaN(parsedMatiereId)) {
          return NextResponse.json({ error: 'Invalid matiereId parameter' }, { status: 400 })
        }
        schedules = await getSchedulesUseCase.getSchedulesBySubject(
          parsedMatiereId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        break

      case 'stats':
        let parsedStatsTeacherId: number | undefined = undefined
        if (teacherId) {
          parsedStatsTeacherId = parseInt(teacherId)
          if (isNaN(parsedStatsTeacherId)) {
            return NextResponse.json({ error: 'Invalid teacherId parameter' }, { status: 400 })
          }
        }
        const stats = await getSchedulesUseCase.getScheduleStats(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined,
          parsedStatsTeacherId
        )
        return NextResponse.json(stats)

      default:
        // Default to current week if no type specified
        const currentWeek = new Date()
        const startOfWeek = new Date(currentWeek)
        startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1) // Monday
        schedules = await getSchedulesUseCase.getSchedulesByWeek(startOfWeek)
        break
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error in schedule API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['teacherId', 'matiereId', 'classeId', 'scheduleDate', 'weekStartDate', 'startTime', 'endTime', 'sessionType']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate that we're not creating a schedule in the past
    Schedule.validateNewScheduleDate(new Date(body.scheduleDate))

    // Create schedule entity
    const schedule = Schedule.create(
      0, // ID will be generated by database
      body.teacherId,
      body.matiereId,
      body.classeId,
      new Date(body.scheduleDate),
      new Date(body.weekStartDate),
      body.startTime,
      body.endTime,
      body.sessionType,
      body.notes,
      false, // not cancelled
      new Date(), // created at
      new Date()  // updated at
    )

    // Create schedule in database
    const createdSchedule = await scheduleRepository.createSchedule(schedule)
    
    // Convert to DTO
    const scheduleDTO = await getSchedulesUseCase.getScheduleById(createdSchedule.getId())
    
    return NextResponse.json(scheduleDTO, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 