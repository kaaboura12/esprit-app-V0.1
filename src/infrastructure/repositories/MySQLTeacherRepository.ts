import { TeacherRepository } from "@/core/interfaces/TeacherRepository"
import { Teacher } from "@/core/entities/Teacher"
import { Email } from "@/core/value-objects/Email"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Teacher Repository Implementation - Infrastructure layer
 * This implements the TeacherRepository interface with Supabase database storage
 */
export class MySQLTeacherRepository implements TeacherRepository {
  // No constructor needed for Supabase

  async findById(id: number): Promise<Teacher | null> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, photo_url, role')
        .eq('id', id)
        .eq('is_active', 1)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return new Teacher(
        data.id,
        data.firstname,
        data.lastname,
        new Email(data.email),
        data.departement,
        data.motdepasse,
        data.photo_url,
        data.role || 'teacher'
      )
    } catch (error) {
      console.error('Error finding teacher by ID:', error)
      throw new Error('Database error occurred while finding teacher')
    }
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    try {
      const emailVO = new Email(email)
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, photo_url, role')
        .eq('email', emailVO.getValue())
        .eq('is_active', 1)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return new Teacher(
        data.id,
        data.firstname,
        data.lastname,
        emailVO,
        data.departement,
        data.motdepasse,
        data.photo_url,
        data.role || 'teacher'
      )
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
        const { error } = await supabase
          .from('teacher')
          .update({
            firstname: teacher.getFirstname(),
            lastname: teacher.getLastname(),
            email: teacher.getEmailValue(),
            departement: teacher.getDepartement(),
            motdepasse: teacher.getHashedPassword(),
            photo_url: teacher.getPhotoUrl(),
            role: teacher.getRole(),
            updated_at: new Date().toISOString()
          })
          .eq('id', teacher.getId())
        if (error) {
          if (error.code === '23505' || error.message.includes('duplicate')) {
            throw new Error('A teacher with this email already exists')
          }
          throw error
        }
      } else {
        // Insert new teacher (ID is auto-increment, so don't provide it)
        const { error } = await supabase
          .from('teacher')
          .insert([
            {
              firstname: teacher.getFirstname(),
              lastname: teacher.getLastname(),
              email: teacher.getEmailValue(),
              departement: teacher.getDepartement(),
              motdepasse: teacher.getHashedPassword(),
              photo_url: teacher.getPhotoUrl(),
              role: teacher.getRole(),
              is_active: 1
            }
          ])
        if (error) {
          if (error.code === '23505' || error.message.includes('duplicate')) {
            throw new Error('A teacher with this email already exists')
          }
          throw error
        }
      }
    } catch (error) {
      console.error('Error saving teacher:', error)
      throw new Error('Database error occurred while saving teacher')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      // Soft delete by setting is_active to 0
      const { error } = await supabase
        .from('teacher')
        .update({ is_active: 0, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting teacher:', error)
      throw new Error('Database error occurred while deleting teacher')
    }
  }

  async findAll(): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, photo_url, role')
        .eq('is_active', 1)
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) throw error
      if (!data) return []
      return data.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url,
        teacherData.role || 'teacher'
      ))
    } catch (error) {
      console.error('Error getting all teachers:', error)
      throw new Error('Database error occurred while fetching teachers')
    }
  }

  async findByDepartement(departement: string): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('id, firstname, lastname, email, departement, motdepasse, photo_url, role')
        .eq('departement', departement)
        .eq('is_active', 1)
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) throw error
      if (!data) return []
      return data.map(teacherData => new Teacher(
        teacherData.id,
        teacherData.firstname,
        teacherData.lastname,
        new Email(teacherData.email),
        teacherData.departement,
        teacherData.motdepasse,
        teacherData.photo_url,
        teacherData.role || 'teacher'
      ))
    } catch (error) {
      console.error('Error finding teachers by department:', error)
      throw new Error('Database error occurred while finding teachers by department')
    }
  }

  async updatePhoto(teacherId: number, photoUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('teacher')
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', teacherId)
        .eq('is_active', 1)
      if (error) throw error
    } catch (error) {
      console.error('Error updating teacher photo:', error)
      throw new Error('Database error occurred while updating teacher photo')
    }
  }

  // Additional helper methods

  async getDepartements(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('teacher')
        .select('departement')
        .eq('is_active', 1)
        .order('departement', { ascending: true })
      if (error) throw error
      if (!data) return []
      // Remove duplicates
      const uniqueDepartments = Array.from(new Set(data.map(row => row.departement)))
      return uniqueDepartments
    } catch (error) {
      console.error('Error getting departments:', error)
      throw new Error('Database error occurred while fetching departments')
    }
  }

  async getTeacherStats(): Promise<{ total: number, byDepartment: { [key: string]: number } }> {
    try {
      // Get total count
      const { data: totalRows, error: totalError } = await supabase
        .from('teacher')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', 1)
      if (totalError) throw totalError
      const total = totalRows?.length || 0

      // Get count by department
      const { data: deptRows, error: deptError } = await supabase
        .from('teacher')
        .select('departement')
        .eq('is_active', 1)
      if (deptError) throw deptError
      const byDepartment: { [key: string]: number } = {}
      if (deptRows) {
        for (const row of deptRows) {
          const key = row.departement ? String(row.departement) : 'Unknown'
          byDepartment[key] = (byDepartment[key] || 0) + 1
        }
      }
      return { total, byDepartment }
    } catch (error) {
      console.error('Error getting teacher stats:', error)
      throw new Error('Database error occurred while fetching teacher statistics')
    }
  }
} 