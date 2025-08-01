import { useState, useEffect } from 'react'
import { ScheduleDTO } from '../../application/dtos/ScheduleDTO'
import { GetSchedulesUseCase } from '../../application/use-cases/GetSchedulesUseCase'
import { useAuth } from './useAuth'

// API service for schedule operations
class ScheduleApiService {
  // Helper method to format dates safely for API calls
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async getSchedulesByWeek(weekStartDate: Date, teacherId?: number): Promise<ScheduleDTO[]> {
    let url = `/api/schedule?type=week&weekStart=${this.formatDateForAPI(weekStartDate)}&_t=${Date.now()}`
    if (teacherId) {
      url += `&teacherId=${teacherId}`
    }
    // console.log('Fetching schedules from URL:', url)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  }

  async getSchedulesByDate(date: Date): Promise<ScheduleDTO[]> {
    const response = await fetch(`/api/schedule?type=date&date=${this.formatDateForAPI(date)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  }

  async getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    let url = `/api/schedule?type=teacher&teacherId=${teacherId}`
    if (startDate) url += `&startDate=${this.formatDateForAPI(startDate)}`
    if (endDate) url += `&endDate=${this.formatDateForAPI(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  }

  async getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    let url = `/api/schedule?type=class&classeId=${classeId}`
    if (startDate) url += `&startDate=${this.formatDateForAPI(startDate)}`
    if (endDate) url += `&endDate=${this.formatDateForAPI(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  }

  async getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<ScheduleDTO[]> {
    let url = `/api/schedule?type=subject&matiereId=${matiereId}`
    if (startDate) url += `&startDate=${this.formatDateForAPI(startDate)}`
    if (endDate) url += `&endDate=${this.formatDateForAPI(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  }

  async getScheduleById(id: number): Promise<ScheduleDTO | null> {
    const response = await fetch(`/api/schedule/${id}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error('Failed to fetch schedule')
    }
    return response.json()
  }

  async getScheduleStats(startDate?: Date, endDate?: Date, teacherId?: number): Promise<any> {
    let url = `/api/schedule?type=stats&_t=${Date.now()}`
    if (startDate) url += `&startDate=${this.formatDateForAPI(startDate)}`
    if (endDate) url += `&endDate=${this.formatDateForAPI(endDate)}`
    if (teacherId) url += `&teacherId=${teacherId}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch schedule stats')
    }
    return response.json()
  }
}

export const useSchedule = () => {
  const { teacher, loading: authLoading } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Initialize API service
  const apiService = new ScheduleApiService()

  /**
   * Load schedules for a specific week
   */
  const loadSchedulesByWeek = async (weekStartDate: Date) => {
    setLoading(true)
    setError(null)
    try {
      const scheduleData = await apiService.getSchedulesByWeek(weekStartDate, teacher?.id)
      setSchedules(scheduleData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load schedules for a specific date
   */
  const loadSchedulesByDate = async (date: Date) => {
    setLoading(true)
    setError(null)
    try {
      const scheduleData = await apiService.getSchedulesByDate(date)
      setSchedules(scheduleData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load schedule statistics
   */
  const loadStats = async () => {
    try {
      const statsData = await apiService.getScheduleStats(undefined, undefined, teacher?.id || undefined)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  /**
   * Load all schedules for the teacher (or all if no teacher)
   */
  const loadAllSchedules = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!teacher?.id) {
        setError('Teacher ID is required to load schedules')
        return
      }
      const scheduleData = await apiService.getSchedulesByTeacher(teacher.id)
      setSchedules(scheduleData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Convert schedules to FullCalendar events
   */
  const getCalendarEvents = () => {
    return schedules.map(schedule => GetSchedulesUseCase.toCalendarEvent(schedule))
  }

  /**
   * Get schedule by ID
   */
  const getScheduleById = async (id: number) => {
    try {
      const schedule = await apiService.getScheduleById(id)
      return schedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
      return null
    }
  }

  // Load initial data
  useEffect(() => {
    if (authLoading) {
      return
    }
    
    if (!teacher) {
      return
    }
    
    const currentWeek = new Date()
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1) // Monday
    loadSchedulesByWeek(startOfWeek)
    loadStats()
  }, [teacher, authLoading])

  return {
    schedules,
    loading: loading || authLoading,
    error,
    stats,
    loadSchedulesByWeek,
    loadSchedulesByDate,
    getCalendarEvents,
    getScheduleById,
    loadStats,
    loadAllSchedules
  }
} 