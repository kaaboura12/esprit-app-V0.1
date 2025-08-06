import bcrypt from 'bcryptjs'
import { AuthRepository } from "@/core/interfaces/AuthRepository"
import { Teacher } from "@/core/entities/Teacher"
import { Email } from "@/core/value-objects/Email"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Authentication Repository Implementation - Infrastructure layer
 * This implements the AuthRepository interface with Supabase database storage
 */
export class MySQLAuthRepository implements AuthRepository {
  // No constructor needed for Supabase

  async findTeacherByEmail(email: Email): Promise<Teacher | null> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, role')
        .eq('email', email.getValue())
        .eq('is_active', 1)
        .maybeSingle()

      if (error) {
        console.error('Error finding teacher by email:', error)
        throw new Error('Database error occurred while finding teacher')
      }
      if (!data) {
        return null
      }
      const teacher = new Teacher(
        data.id,
        data.firstname,
        data.lastname,
        email, // Use the email value object passed in
        data.departement,
        data.motdepasse,
        undefined, // photoUrl
        data.role || 'teacher'
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
      const { error } = await supabase
        .from('teacher')
        .update({ last_login: new Date().toISOString() })
        .eq('id', teacherId)
      if (error) {
        console.error('Error updating last login:', error)
      }
    } catch (error) {
      console.error('Error updating last login:', error)
      // Don't throw error for this operation as it's not critical
    }
  }

  async findTeacherById(id: number): Promise<Teacher | null> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, role')
        .eq('id', id)
        .eq('is_active', 1)
        .maybeSingle()
      if (error) {
        console.error('Error finding teacher by ID:', error)
        throw new Error('Database error occurred while finding teacher')
      }
      if (!data) {
        return null
      }
      const teacher = new Teacher(
        data.id,
        data.firstname,
        data.lastname,
        new Email(data.email),
        data.departement,
        data.motdepasse,
        undefined,
        data.role || 'teacher'
      )
      return teacher
    } catch (error) {
      console.error('Error finding teacher by ID:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async getAllTeachers(): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, role')
        .eq('is_active', 1)
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) {
        console.error('Error getting all teachers:', error)
        throw new Error('Database error occurred while fetching teachers')
      }
      if (!data) return []
      return data.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        undefined,
        teacherData.role || 'teacher'
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
    plainPassword: string,
    role: string = 'teacher'
  ): Promise<Teacher> {
    try {
      const emailVO = new Email(email)
      const hashedPassword = await this.hashPassword(plainPassword)
      
      // First, try without the role column to see if that's the issue
      const insertData: any = {
        firstname,
        lastname,
        email: emailVO.getValue(),
        departement,
        motdepasse: hashedPassword,
        is_active: 1
      }
      
      // Only add role if it's not the default 'teacher'
      if (role !== 'teacher') {
        insertData.role = role
      }
      
      const { data, error } = await supabase
        .from('teacher')
        .insert([insertData])
        .select('id')
        .single()
        
      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate')) {
          throw new Error('A teacher with this email already exists')
        }
        throw new Error(`Database error occurred while creating teacher: ${error.message}`)
      }
      
      const teacherId = data.id
      const teacher = new Teacher(
        teacherId,
        firstname,
        lastname,
        emailVO,
        departement,
        hashedPassword,
        undefined,
        role
      )
      return teacher
    } catch (error) {
      console.error('Error creating teacher:', error)
      throw error
    }
  }
} 