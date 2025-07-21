import { TeacherRepository } from "@/core/interfaces/TeacherRepository"
import { Teacher } from "@/core/entities/Teacher"
import { Email } from "@/core/value-objects/Email"
import { getConnectionPool } from "@/infrastructure/config/database"
import mysql from 'mysql2/promise'

/**
 * MySQL Teacher Repository Implementation - Infrastructure layer
 * This implements the TeacherRepository interface with MySQL database storage
 */
export class MySQLTeacherRepository implements TeacherRepository {
  private pool: mysql.Pool

  constructor() {
    this.pool = getConnectionPool()
  }

  async findById(id: number): Promise<Teacher | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse, photo_url FROM teacher WHERE id = ? AND is_active = 1',
        [id]
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      if (teachers.length === 0) {
        return null
      }

      const teacherData = teachers[0]
      
      const teacher = new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url
      )

      return teacher

    } catch (error) {
      console.error('Error finding teacher by ID:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    try {
      const emailVO = new Email(email)
      
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse, photo_url FROM teacher WHERE email = ? AND is_active = 1',
        [emailVO.getValue()]
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      if (teachers.length === 0) {
        return null
      }

      const teacherData = teachers[0]
      
      const teacher = new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        emailVO,
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url
      )

      return teacher

    } catch (error) {
      console.error('Error finding teacher by email:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async save(teacher: Teacher): Promise<void> {
    try {
      // Check if teacher exists
      const existingTeacher = await this.findById(teacher.getId())
      
      if (existingTeacher) {
        // Update existing teacher
        await this.pool.execute(
          'UPDATE teacher SET firstname = ?, lastname = ?, email = ?, departement = ?, motdepasse = ?, photo_url = ?, updated_at = NOW() WHERE id = ?',
          [
            teacher.getFirstname(),
            teacher.getLastname(),
            teacher.getEmailValue(),
            teacher.getDepartement(),
            teacher.getHashedPassword(),
            teacher.getPhotoUrl(),
            teacher.getId()
          ]
        )
      } else {
        // Insert new teacher (this might not work as ID is auto-increment)
        await this.pool.execute(
          'INSERT INTO teacher (id, firstname, lastname, email, departement, motdepasse, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            teacher.getId(),
            teacher.getFirstname(),
            teacher.getLastname(),
            teacher.getEmailValue(),
            teacher.getDepartement(),
            teacher.getHashedPassword(),
            teacher.getPhotoUrl()
          ]
        )
      }

    } catch (error) {
      console.error('Error saving teacher:', error)
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('A teacher with this email already exists')
      }
      throw new Error('Database error occurred while saving teacher')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      // Soft delete by setting is_active to 0
      await this.pool.execute(
        'UPDATE teacher SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      )

    } catch (error) {
      console.error('Error deleting teacher:', error)
      throw new Error('Database error occurred while deleting teacher')
    }
  }

  async findAll(): Promise<Teacher[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse, photo_url FROM teacher WHERE is_active = 1 ORDER BY lastname, firstname'
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      return teachers.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url
      ))

    } catch (error) {
      console.error('Error getting all teachers:', error)
      throw new Error('Database error occurred while fetching teachers')
    }
  }

  async findByDepartement(departement: string): Promise<Teacher[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse, photo_url FROM teacher WHERE departement = ? AND is_active = 1 ORDER BY lastname, firstname',
        [departement]
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      return teachers.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url
      ))

    } catch (error) {
      console.error('Error finding teachers by department:', error)
      throw new Error('Database error occurred while finding teachers by department')
    }
  }

  async updatePhoto(teacherId: number, photoUrl: string): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE teacher SET photo_url = ?, updated_at = NOW() WHERE id = ? AND is_active = 1',
        [photoUrl, teacherId]
      )

    } catch (error) {
      console.error('Error updating teacher photo:', error)
      throw new Error('Database error occurred while updating teacher photo')
    }
  }

  // Additional helper methods
  
  async getDepartements(): Promise<string[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT DISTINCT departement FROM teacher WHERE is_active = 1 ORDER BY departement'
      )

      const departments = rows as mysql.RowDataPacket[]
      
      return departments.map(row => row.departement)

    } catch (error) {
      console.error('Error getting departments:', error)
      throw new Error('Database error occurred while fetching departments')
    }
  }

  async getTeacherStats(): Promise<{ total: number, byDepartment: { [key: string]: number } }> {
    try {
      // Get total count
      const [totalRows] = await this.pool.execute(
        'SELECT COUNT(*) as total FROM teacher WHERE is_active = 1'
      )
      const total = (totalRows as mysql.RowDataPacket[])[0].total

      // Get count by department
      const [deptRows] = await this.pool.execute(
        'SELECT departement, COUNT(*) as count FROM teacher WHERE is_active = 1 GROUP BY departement ORDER BY departement'
      )

      const departments = deptRows as mysql.RowDataPacket[]
      const byDepartment: { [key: string]: number } = {}
      
      departments.forEach(row => {
        byDepartment[row.departement] = row.count
      })

      return { total, byDepartment }

    } catch (error) {
      console.error('Error getting teacher stats:', error)
      throw new Error('Database error occurred while fetching teacher statistics')
    }
  }
} 