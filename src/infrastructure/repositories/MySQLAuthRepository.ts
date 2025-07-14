import bcrypt from 'bcryptjs'
import { AuthRepository } from "@/core/interfaces/AuthRepository"
import { Teacher } from "@/core/entities/Teacher"
import { Email } from "@/core/value-objects/Email"
import { getConnectionPool } from "@/infrastructure/config/database"
import mysql from 'mysql2/promise'

/**
 * MySQL Authentication Repository Implementation - Infrastructure layer
 * This implements the AuthRepository interface with MySQL database storage
 */
export class MySQLAuthRepository implements AuthRepository {
  private pool: mysql.Pool

  constructor() {
    this.pool = getConnectionPool()
  }

  async findTeacherByEmail(email: Email): Promise<Teacher | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse FROM teacher WHERE email = ? AND is_active = 1',
        [email.getValue()]
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      if (teachers.length === 0) {
        return null
      }

      const teacherData = teachers[0]
      
      // Create Teacher entity using the existing email value object
      const teacher = new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        email, // Use the email value object passed in
        teacherData.departement,
        teacherData.motdepasse
      )

      return teacher

    } catch (error) {
      console.error('Error finding teacher by email:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      console.error('Password verification failed:', error)
      return false
    }
  }

  async hashPassword(plainPassword: string): Promise<string> {
    try {
      const saltRounds = 12
      return await bcrypt.hash(plainPassword, saltRounds)
    } catch (error) {
      console.error('Password hashing failed:', error)
      throw new Error('Failed to hash password')
    }
  }

  // Additional helper methods for teacher management

  async updateLastLogin(teacherId: number): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE teacher SET last_login = NOW() WHERE id = ?',
        [teacherId]
      )
    } catch (error) {
      console.error('Error updating last login:', error)
      // Don't throw error for this operation as it's not critical
    }
  }

  async findTeacherById(id: number): Promise<Teacher | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse FROM teacher WHERE id = ? AND is_active = 1',
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
        teacherData.motdepasse
      )

      return teacher

    } catch (error) {
      console.error('Error finding teacher by ID:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async getAllTeachers(): Promise<Teacher[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, departement, motdepasse FROM teacher WHERE is_active = 1 ORDER BY lastname, firstname'
      )

      const teachers = rows as mysql.RowDataPacket[]
      
      return teachers.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse
      ))

    } catch (error) {
      console.error('Error getting all teachers:', error)
      throw new Error('Database error occurred while fetching teachers')
    }
  }

  async createTeacher(
    firstname: string,
    lastname: string,
    email: string,
    departement: string,
    plainPassword: string
  ): Promise<Teacher> {
    try {
      const emailVO = new Email(email)
      const hashedPassword = await this.hashPassword(plainPassword)

      const [result] = await this.pool.execute(
        'INSERT INTO teacher (firstname, lastname, email, departement, motdepasse) VALUES (?, ?, ?, ?, ?)',
        [firstname, lastname, emailVO.getValue(), departement, hashedPassword]
      )

      const insertResult = result as mysql.ResultSetHeader
      const teacherId = insertResult.insertId

      const teacher = new Teacher(
        teacherId,
        firstname,
        lastname,
        emailVO,
        departement,
        hashedPassword
      )

      return teacher

    } catch (error) {
      console.error('Error creating teacher:', error)
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('A teacher with this email already exists')
      }
      throw new Error('Database error occurred while creating teacher')
    }
  }
} 