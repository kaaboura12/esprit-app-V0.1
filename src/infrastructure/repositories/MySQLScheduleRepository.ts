import { ScheduleRepository } from "@/core/interfaces/ScheduleRepository"
import { Schedule } from "@/core/entities/Schedule"
import { getConnectionPool } from "@/infrastructure/config/database"
import mysql from 'mysql2/promise'

/**
 * MySQL Schedule Repository Implementation - Infrastructure layer
 * This implements the ScheduleRepository interface with MySQL database storage
 */
export class MySQLScheduleRepository implements ScheduleRepository {
  private pool: mysql.Pool

  constructor() {
    this.pool = getConnectionPool()
  }

  async getSchedulesByWeek(weekStartDate: Date): Promise<Schedule[]> {
    try {
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)

      const [rows] = await this.pool.execute(
        `SELECT s.*, 
                CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                m.nommatiere,
                c.nom_classe,
                CONCAT(c.bloc, c.numclasse) as classroom
         FROM schedule s
         JOIN teacher t ON s.teacher_id = t.id
         JOIN matiere m ON s.matiere_id = m.id
         JOIN classe c ON s.classe_id = c.id
         WHERE s.schedule_date BETWEEN ? AND ?
         AND s.is_cancelled = FALSE
         ORDER BY s.schedule_date, s.start_time`,
        [weekStartDate.toISOString().split('T')[0], weekEndDate.toISOString().split('T')[0]]
      )

      const schedules = rows as mysql.RowDataPacket[]
      return schedules.map(this.mapRowToSchedule)
    } catch (error) {
      console.error('Error getting schedules by week:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByDate(date: Date): Promise<Schedule[]> {
    try {
      const [rows] = await this.pool.execute(
        `SELECT s.*, 
                CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                m.nommatiere,
                c.nom_classe,
                CONCAT(c.bloc, c.numclasse) as classroom
         FROM schedule s
         JOIN teacher t ON s.teacher_id = t.id
         JOIN matiere m ON s.matiere_id = m.id
         JOIN classe c ON s.classe_id = c.id
         WHERE s.schedule_date = ?
         AND s.is_cancelled = FALSE
         ORDER BY s.start_time`,
        [date.toISOString().split('T')[0]]
      )

      const schedules = rows as mysql.RowDataPacket[]
      return schedules.map(this.mapRowToSchedule)
    } catch (error) {
      console.error('Error getting schedules by date:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByTeacher(teacherId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = `SELECT s.*, 
                          CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                          m.nommatiere,
                          c.nom_classe,
                          CONCAT(c.bloc, c.numclasse) as classroom
                   FROM schedule s
                   JOIN teacher t ON s.teacher_id = t.id
                   JOIN matiere m ON s.matiere_id = m.id
                   JOIN classe c ON s.classe_id = c.id
                   WHERE s.teacher_id = ?
                   AND s.is_cancelled = FALSE`

      const params: any[] = [teacherId]

      if (startDate) {
        query += ' AND s.schedule_date >= ?'
        params.push(startDate.toISOString().split('T')[0])
      }

      if (endDate) {
        query += ' AND s.schedule_date <= ?'
        params.push(endDate.toISOString().split('T')[0])
      }

      query += ' ORDER BY s.schedule_date, s.start_time'

      const [rows] = await this.pool.execute(query, params)
      const schedules = rows as mysql.RowDataPacket[]
      return schedules.map(this.mapRowToSchedule)
    } catch (error) {
      console.error('Error getting schedules by teacher:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesByClass(classeId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = `SELECT s.*, 
                          CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                          m.nommatiere,
                          c.nom_classe,
                          CONCAT(c.bloc, c.numclasse) as classroom
                   FROM schedule s
                   JOIN teacher t ON s.teacher_id = t.id
                   JOIN matiere m ON s.matiere_id = m.id
                   JOIN classe c ON s.classe_id = c.id
                   WHERE s.classe_id = ?
                   AND s.is_cancelled = FALSE`

      const params: any[] = [classeId]

      if (startDate) {
        query += ' AND s.schedule_date >= ?'
        params.push(startDate.toISOString().split('T')[0])
      }

      if (endDate) {
        query += ' AND s.schedule_date <= ?'
        params.push(endDate.toISOString().split('T')[0])
      }

      query += ' ORDER BY s.schedule_date, s.start_time'

      const [rows] = await this.pool.execute(query, params)
      const schedules = rows as mysql.RowDataPacket[]
      return schedules.map(this.mapRowToSchedule)
    } catch (error) {
      console.error('Error getting schedules by class:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getSchedulesBySubject(matiereId: number, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    try {
      let query = `SELECT s.*, 
                          CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                          m.nommatiere,
                          c.nom_classe,
                          CONCAT(c.bloc, c.numclasse) as classroom
                   FROM schedule s
                   JOIN teacher t ON s.teacher_id = t.id
                   JOIN matiere m ON s.matiere_id = m.id
                   JOIN classe c ON s.classe_id = c.id
                   WHERE s.matiere_id = ?
                   AND s.is_cancelled = FALSE`

      const params: any[] = [matiereId]

      if (startDate) {
        query += ' AND s.schedule_date >= ?'
        params.push(startDate.toISOString().split('T')[0])
      }

      if (endDate) {
        query += ' AND s.schedule_date <= ?'
        params.push(endDate.toISOString().split('T')[0])
      }

      query += ' ORDER BY s.schedule_date, s.start_time'

      const [rows] = await this.pool.execute(query, params)
      const schedules = rows as mysql.RowDataPacket[]
      return schedules.map(this.mapRowToSchedule)
    } catch (error) {
      console.error('Error getting schedules by subject:', error)
      throw new Error('Database error occurred while getting schedules')
    }
  }

  async getScheduleById(id: number): Promise<Schedule | null> {
    try {
      const [rows] = await this.pool.execute(
        `SELECT s.*, 
                CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                m.nommatiere,
                c.nom_classe,
                CONCAT(c.bloc, c.numclasse) as classroom
         FROM schedule s
         JOIN teacher t ON s.teacher_id = t.id
         JOIN matiere m ON s.matiere_id = m.id
         JOIN classe c ON s.classe_id = c.id
         WHERE s.id = ?`,
        [id]
      )

      const schedules = rows as mysql.RowDataPacket[]
      
      if (schedules.length === 0) {
        return null
      }

      return this.mapRowToSchedule(schedules[0])
    } catch (error) {
      console.error('Error getting schedule by ID:', error)
      throw new Error('Database error occurred while getting schedule')
    }
  }

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO schedule (
          teacher_id, matiere_id, classe_id, day_of_week, 
          schedule_date, week_start_date, start_time, end_time, 
          session_type, notes, is_cancelled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          schedule.getTeacherId(),
          schedule.getMatiereId(),
          schedule.getClasseId(),
          schedule.getDayOfWeek(),
          schedule.getScheduleDate().toISOString().split('T')[0],
          schedule.getWeekStartDate().toISOString().split('T')[0],
          schedule.getStartTime(),
          schedule.getEndTime(),
          schedule.getSessionType(),
          schedule.getNotes(),
          schedule.getIsCancelled()
        ]
      )

      const insertResult = result as mysql.ResultSetHeader
      const createdSchedule = await this.getScheduleById(insertResult.insertId)
      
      if (!createdSchedule) {
        throw new Error('Failed to retrieve created schedule')
      }

      return createdSchedule
    } catch (error) {
      console.error('Error creating schedule:', error)
      throw new Error('Database error occurred while creating schedule')
    }
  }

  async updateSchedule(id: number, updates: Partial<Schedule>): Promise<Schedule> {
    try {
      // Build dynamic update query
      const updateFields: string[] = []
      const params: any[] = []

      // Add fields to update (this would need to be expanded based on your needs)
      if (updates.getNotes !== undefined) {
        updateFields.push('notes = ?')
        params.push(updates.getNotes?.())
      }

      if (updates.getIsCancelled !== undefined) {
        updateFields.push('is_cancelled = ?')
        params.push(updates.getIsCancelled?.())
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update')
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      params.push(id)

      await this.pool.execute(
        `UPDATE schedule SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      )

      const updatedSchedule = await this.getScheduleById(id)
      
      if (!updatedSchedule) {
        throw new Error('Schedule not found after update')
      }

      return updatedSchedule
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw new Error('Database error occurred while updating schedule')
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      await this.pool.execute('DELETE FROM schedule WHERE id = ?', [id])
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw new Error('Database error occurred while deleting schedule')
    }
  }

  async cancelSchedule(id: number): Promise<Schedule> {
    try {
      await this.pool.execute(
        'UPDATE schedule SET is_cancelled = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      )

      const cancelledSchedule = await this.getScheduleById(id)
      
      if (!cancelledSchedule) {
        throw new Error('Schedule not found after cancellation')
      }

      return cancelledSchedule
    } catch (error) {
      console.error('Error cancelling schedule:', error)
      throw new Error('Database error occurred while cancelling schedule')
    }
  }

  async checkConflicts(schedule: Schedule): Promise<Schedule[]> {
    try {
      const [rows] = await this.pool.execute(
        `SELECT s.*, 
                CONCAT(t.firstname, ' ', t.lastname) as teacher_name,
                m.nommatiere,
                c.nom_classe,
                CONCAT(c.bloc, c.numclasse) as classroom
         FROM schedule s
         JOIN teacher t ON s.teacher_id = t.id
         JOIN matiere m ON s.matiere_id = m.id
         JOIN classe c ON s.classe_id = c.id
         WHERE s.schedule_date = ?
         AND s.is_cancelled = FALSE
         AND s.id != ?
         AND (
           (s.teacher_id = ? AND s.start_time < ? AND s.end_time > ?) OR
           (s.classe_id = ? AND s.start_time < ? AND s.end_time > ?)
         )`,
        [
          schedule.getScheduleDate().toISOString().split('T')[0],
          schedule.getId(),
          schedule.getTeacherId(),
          schedule.getEndTime(),
          schedule.getStartTime(),
          schedule.getClasseId(),
          schedule.getEndTime(),
          schedule.getStartTime()
        ]
      )

      const conflicts = rows as mysql.RowDataPacket[]
      return conflicts.map(this.mapRowToSchedule)
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
      let query = `SELECT 
                     COUNT(*) as total_schedules,
                     COUNT(CASE WHEN is_cancelled = FALSE THEN 1 END) as active_schedules,
                     COUNT(CASE WHEN is_cancelled = TRUE THEN 1 END) as cancelled_schedules,
                     COUNT(CASE WHEN session_type = 'cours' AND is_cancelled = FALSE THEN 1 END) as course_count,
                     COUNT(CASE WHEN session_type = 'exam' AND is_cancelled = FALSE THEN 1 END) as exam_count,
                     COUNT(CASE WHEN session_type = 'td' AND is_cancelled = FALSE THEN 1 END) as td_count,
                     COUNT(CASE WHEN session_type = 'tp' AND is_cancelled = FALSE THEN 1 END) as tp_count
                   FROM schedule
                   WHERE 1=1`

      const params: any[] = []

      if (startDate) {
        query += ' AND schedule_date >= ?'
        params.push(startDate.toISOString().split('T')[0])
      }

      if (endDate) {
        query += ' AND schedule_date <= ?'
        params.push(endDate.toISOString().split('T')[0])
      }

      if (teacherId) {
        query += ' AND teacher_id = ?'
        params.push(teacherId)
      }

      const [rows] = await this.pool.execute(query, params)
      const stats = (rows as mysql.RowDataPacket[])[0]

      return {
        totalSchedules: stats.total_schedules,
        activeSchedules: stats.active_schedules,
        cancelledSchedules: stats.cancelled_schedules,
        courseCount: stats.course_count,
        examCount: stats.exam_count,
        tdCount: stats.td_count,
        tpCount: stats.tp_count
      }
    } catch (error) {
      console.error('Error getting schedule stats:', error)
      throw new Error('Database error occurred while getting schedule stats')
    }
  }

  /**
   * Map database row to Schedule entity
   */
  private mapRowToSchedule(row: mysql.RowDataPacket): Schedule {
    // Handle MySQL date/time properly
    const scheduleDate = new Date(row.schedule_date)
    const weekStartDate = new Date(row.week_start_date)
    
    const schedule = Schedule.create(
      row.id,
      row.teacher_id,
      row.matiere_id,
      row.classe_id,
      row.day_of_week,
      scheduleDate,
      weekStartDate,
      row.start_time,
      row.end_time,
      row.session_type,
      row.notes,
      Boolean(row.is_cancelled), // Convert MySQL TINYINT to boolean
      row.created_at ? new Date(row.created_at) : undefined,
      row.updated_at ? new Date(row.updated_at) : undefined
    )
    
    // Add related data from joins
    ;(schedule as any).teacherName = row.teacher_name
    ;(schedule as any).matiereNom = row.nommatiere
    ;(schedule as any).classeNom = row.nom_classe
    ;(schedule as any).classroom = row.classroom
    
    return schedule
  }
} 