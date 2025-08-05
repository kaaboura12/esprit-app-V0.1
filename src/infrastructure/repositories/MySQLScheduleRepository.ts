import { ScheduleRepository } from "@/core/interfaces/ScheduleRepository"
import { Schedule } from "@/core/entities/Schedule"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Schedule Repository Implementation - Infrastructure layer
 * This implements the ScheduleRepository interface with Supabase database storage
 */
export class MySQLScheduleRepository implements ScheduleRepository {
  // No constructor needed for Supabase

  async getSchedulesByWeek(weekStartDate: Date): Promise<Schedule[]> {
    try {
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .gte('schedule_date', this.formatDateForDatabase(weekStartDate))
        .lte('schedule_date', this.formatDateForDatabase(weekEndDate))
        .eq('is_cancelled', false)
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true })
      if (error) throw error
      return await this.enrichSchedules(data || [])
    } catch (error) {
      console.error('Error getting schedules by week:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByDate(date: Date): Promise<Schedule[]> {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('schedule_date', this.formatDateForDatabase(date))
        .eq('is_cancelled', false)
        .order('start_time', { ascending: true })
      if (error) throw error
      return await this.enrichSchedules(data || [])
    } catch (error) {
      console.error('Error getting schedules by date:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = supabase
        .from('schedule')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_cancelled', false)
      if (startDate) query = query.gte('schedule_date', this.formatDateForDatabase(startDate))
      if (endDate) query = query.lte('schedule_date', this.formatDateForDatabase(endDate))
      query = query.order('schedule_date', { ascending: true }).order('start_time', { ascending: true })
      const { data, error } = await query
      if (error) throw error
      return await this.enrichSchedules(data || [])
    } catch (error) {
      console.error('Error getting schedules by teacher:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = supabase
        .from('schedule')
        .select('*')
        .eq('classe_id', classeId)
        .eq('is_cancelled', false)
      if (startDate) query = query.gte('schedule_date', this.formatDateForDatabase(startDate))
      if (endDate) query = query.lte('schedule_date', this.formatDateForDatabase(endDate))
      query = query.order('schedule_date', { ascending: true }).order('start_time', { ascending: true })
      const { data, error } = await query
      if (error) throw error
      return await this.enrichSchedules(data || [])
    } catch (error) {
      console.error('Error getting schedules by class:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = supabase
        .from('schedule')
        .select('*')
        .eq('matiere_id', matiereId)
        .eq('is_cancelled', false)
      if (startDate) query = query.gte('schedule_date', this.formatDateForDatabase(startDate))
      if (endDate) query = query.lte('schedule_date', this.formatDateForDatabase(endDate))
      query = query.order('schedule_date', { ascending: true }).order('start_time', { ascending: true })
      const { data, error } = await query
      if (error) throw error
      return await this.enrichSchedules(data || [])
    } catch (error) {
      console.error('Error getting schedules by subject:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getScheduleById(id: number): Promise<Schedule | null> {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const [enriched] = await this.enrichSchedules([data])
      return enriched || null
    } catch (error) {
      console.error('Error getting schedule by ID:', error)
      throw new Error('Database error occurred while getting schedule')
    }
  }

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    try {
      // Try to get the next available ID first
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from('schedule')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      
      let nextId = 1
      if (!maxIdError && maxIdResult) {
        nextId = maxIdResult.id + 1
      }
      
      console.log('Next available schedule ID:', nextId)
      
      const { data, error } = await supabase
        .from('schedule')
        .insert([
          {
            id: nextId,
            teacher_id: schedule.getTeacherId(),
            matiere_id: schedule.getMatiereId(),
            classe_id: schedule.getClasseId(),
            schedule_date: this.formatDateForDatabase(schedule.getScheduleDate()),
            week_start_date: this.formatDateForDatabase(schedule.getWeekStartDate()),
            start_time: schedule.getStartTime(),
            end_time: schedule.getEndTime(),
            session_type: schedule.getSessionType(),
            notes: schedule.getNotes(),
            is_cancelled: schedule.getIsCancelled()
          }
        ])
        .select('*')
        .single()
      if (error) throw error
      const [enriched] = await this.enrichSchedules([data])
      if (!enriched) throw new Error('Failed to retrieve created schedule')
      return enriched
    } catch (error) {
      console.error('Error creating schedule:', error)
      throw new Error('Database error occurred while creating schedule')
    }
  }

  async updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule> {
    try {
      const updateObj: any = {}
      if (updates.getNotes !== undefined) updateObj.notes = updates.getNotes?.()
      if (updates.getIsCancelled !== undefined) updateObj.is_cancelled = updates.getIsCancelled?.()
      if (Object.keys(updateObj).length === 0) throw new Error('No fields to update')
      updateObj.updated_at = new Date().toISOString()
      const { error } = await supabase
        .from('schedule')
        .update(updateObj)
        .eq('id', id)
      if (error) throw error
      const updatedSchedule = await this.getScheduleById(id)
      if (!updatedSchedule) throw new Error('Schedule not found after update')
      return updatedSchedule
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw new Error('Database error occurred while updating schedule')
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw new Error('Database error occurred while deleting schedule')
    }
  }

  async cancelSchedule(id: number): Promise<Schedule> {
    try {
      const { error } = await supabase
        .from('schedule')
        .update({ is_cancelled: true, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      const cancelledSchedule = await this.getScheduleById(id)
      if (!cancelledSchedule) throw new Error('Schedule not found after cancellation')
      return cancelledSchedule
    } catch (error) {
      console.error('Error cancelling schedule:', error)
      throw new Error('Database error occurred while cancelling schedule')
    }
  }

  async checkConflicts(schedule: Schedule): Promise<Schedule[]> {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('schedule_date', this.formatDateForDatabase(schedule.getScheduleDate()))
        .eq('is_cancelled', false)
        .neq('id', schedule.getId())
      if (error) throw error
      // Filter for time overlap and teacher/classroom conflicts
      const conflicts = (data || []).filter((s: any) =>
        ((s.teacher_id === schedule.getTeacherId() && s.start_time < schedule.getEndTime() && s.end_time > schedule.getStartTime()) ||
         (s.classe_id === schedule.getClasseId() && s.start_time < schedule.getEndTime() && s.end_time > schedule.getStartTime()))
      )
      return await this.enrichSchedules(conflicts)
    } catch (error) {
      console.error('Error checking schedule conflicts:', error)
      throw new Error('Database error occurred while checking conflicts')
    }
  }

  async getScheduleStats(startDate?: Date, endDate?: Date, teacherId?: number): Promise<{
    totalSchedules: number
    activeSchedules: number
    cancelledSchedules: number
    courseCount: number
    examCount: number
    tdCount: number
    tpCount: number
  }> {
    try {
      let query = supabase
        .from('schedule')
        .select('id, is_cancelled, session_type, teacher_id, schedule_date')
      if (startDate) query = query.gte('schedule_date', this.formatDateForDatabase(startDate))
      if (endDate) query = query.lte('schedule_date', this.formatDateForDatabase(endDate))
      if (teacherId) query = query.eq('teacher_id', teacherId)
      const { data, error } = await query
      if (error) throw error
      const schedules = data || []
      return {
        totalSchedules: schedules.length,
        activeSchedules: schedules.filter(s => !s.is_cancelled).length,
        cancelledSchedules: schedules.filter(s => s.is_cancelled).length,
        courseCount: schedules.filter(s => s.session_type === 'cours' && !s.is_cancelled).length,
        examCount: schedules.filter(s => s.session_type === 'exam' && !s.is_cancelled).length,
        tdCount: schedules.filter(s => s.session_type === 'td' && !s.is_cancelled).length,
        tpCount: schedules.filter(s => s.session_type === 'tp' && !s.is_cancelled).length
      }
    } catch (error) {
      console.error('Error getting schedule stats:', error)
      throw new Error('Database error occurred while getting schedule stats')
    }
  }

  async findClasseIdByName(nomClasse: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('classe')
        .select('id')
        .ilike('nom_classe', nomClasse)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ? data.id : null
    } catch (error) {
      console.error('Error finding class by name:', error)
      return null
    }
  }

  async findMatiereIdByName(nomMatiere: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('matiere')
        .select('id')
        .ilike('nommatiere', nomMatiere)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ? data.id : null
    } catch (error) {
      console.error('Error finding subject by name:', error)
      return null
    }
  }

  /**
   * Enrich schedules with teacher, matiere, and classe info
   */
  private async enrichSchedules(schedules: any[]): Promise<Schedule[]> {
    // Fetch all related teacher, matiere, classe in parallel
    const teacherIds = [...new Set(schedules.map(s => s.teacher_id))]
    const matiereIds = [...new Set(schedules.map(s => s.matiere_id))]
    const classeIds = [...new Set(schedules.map(s => s.classe_id))]
    const [{ data: teachers }, { data: matieres }, { data: classes }] = await Promise.all([
      supabase.from('teacher').select('id, firstname, lastname'),
      supabase.from('matiere').select('id, nommatiere'),
      supabase.from('classe').select('id, nom_classe, bloc, numclasse')
    ])
    return schedules.map(row => {
      const scheduleDate = this.parseDateFromDatabase(row.schedule_date)
      const weekStartDate = this.parseDateFromDatabase(row.week_start_date)
      const schedule = Schedule.create(
        row.id,
        row.teacher_id,
        row.matiere_id,
        row.classe_id,
        scheduleDate,
        weekStartDate,
        row.start_time,
        row.end_time,
        row.session_type,
        row.notes,
        Boolean(row.is_cancelled),
        row.created_at ? new Date(row.created_at) : undefined,
        row.updated_at ? new Date(row.updated_at) : undefined
      )
      // Add related data from joins
      const teacher = teachers?.find(t => t.id === row.teacher_id)
      const matiere = matieres?.find(m => m.id === row.matiere_id)
      const classe = classes?.find(c => c.id === row.classe_id)
      ;(schedule as any).teacherName = teacher ? `${teacher.firstname} ${teacher.lastname}` : undefined
      ;(schedule as any).matiereNom = matiere?.nommatiere
      ;(schedule as any).classeNom = classe?.nom_classe
      ;(schedule as any).classroom = classe ? `${classe.bloc}${classe.numclasse}` : undefined
      return schedule
    })
  }

  /**
   * Parse date from database - timezone safe
   */
  private parseDateFromDatabase(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      const year = dateInput.getFullYear()
      const month = dateInput.getMonth()
      const day = dateInput.getDate()
      return new Date(Date.UTC(year, month, day, 12, 0, 0, 0))
    }
    if (typeof dateInput === 'string') {
      const [year, month, day] = dateInput.split('-').map(Number)
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
    }
    console.warn('Unexpected date input type:', typeof dateInput, dateInput)
    return new Date(dateInput)
  }

  /**
   * Format date for database storage - timezone safe
   */
  private formatDateForDatabase(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
} 