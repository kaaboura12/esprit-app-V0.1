import { StudentRepository } from "@/core/interfaces/StudentRepository"
import { Etudiant } from "@/core/entities/Etudiant"
import { Email } from "@/core/value-objects/Email"
import { StudentNumber } from "@/core/value-objects/StudentNumber"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Student Repository Implementation - Infrastructure layer
 * This implements the StudentRepository interface with Supabase database storage
 */
export class MySQLStudentRepository implements StudentRepository {
  // No constructor needed for Supabase

  async findById(id: number): Promise<Etudiant | null> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return new Etudiant(
        data.id,
        data.firstname,
        data.lastname,
        new Email(data.email),
        data.classe_id,
        new StudentNumber(data.numero_etudiant),
        data.date_naissance
      )
    } catch (error) {
      console.error('Error finding student by ID:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async findByIds(ids: number[]): Promise<Etudiant[]> {
    try {
      if (ids.length === 0) return []
      
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .in('id', ids)
      
      if (error) throw error
      if (!data) return []
      
      return data.map(student => new Etudiant(
        student.id,
        student.firstname,
        student.lastname,
        new Email(student.email),
        student.classe_id,
        new StudentNumber(student.numero_etudiant),
        student.date_naissance
      ))
    } catch (error) {
      console.error('Error finding students by IDs:', error)
      throw new Error('Database error occurred while finding students')
    }
  }

  async findByEmail(email: Email): Promise<Etudiant | null> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('email', email.getValue())
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return new Etudiant(
        data.id,
        data.firstname,
        data.lastname,
        email,
        data.classe_id,
        new StudentNumber(data.numero_etudiant),
        data.date_naissance
      )
    } catch (error) {
      console.error('Error finding student by email:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async findByStudentNumber(studentNumber: StudentNumber): Promise<Etudiant | null> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('numero_etudiant', studentNumber.getValue())
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return new Etudiant(
        data.id,
        data.firstname,
        data.lastname,
        new Email(data.email),
        data.classe_id,
        studentNumber,
        data.date_naissance
      )
    } catch (error) {
      console.error('Error finding student by student number:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async create(etudiant: Etudiant): Promise<Etudiant> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .insert([
          {
            firstname: etudiant.getFirstname(),
            lastname: etudiant.getLastname(),
            email: etudiant.getEmailValue(),
            classe_id: etudiant.getClasseId(),
            numero_etudiant: etudiant.getNumeroEtudiantValue(),
            date_naissance: etudiant.getDateNaissance()
          }
        ])
        .select('*')
        .single()
      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate')) {
          throw new Error('Un étudiant avec cet email ou ce numéro existe déjà')
        }
        throw error
      }
      return new Etudiant(
        data.id,
        data.firstname,
        data.lastname,
        new Email(data.email),
        data.classe_id,
        new StudentNumber(data.numero_etudiant),
        data.date_naissance
      )
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  async findByClasseId(classeId: number): Promise<Etudiant[]> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('classe_id', classeId)
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) throw error
      if (!data) return []
      return data.map(studentData => new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        new Email(studentData.email),
        studentData.classe_id,
        new StudentNumber(studentData.numero_etudiant),
        studentData.date_naissance
      ))
    } catch (error) {
      console.error('Error finding students by class ID:', error)
      throw new Error('Database error occurred while finding students by class')
    }
  }

  async findAll(): Promise<Etudiant[]> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) throw error
      if (!data) return []
      return data.map(studentData => new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        new Email(studentData.email),
        studentData.classe_id,
        new StudentNumber(studentData.numero_etudiant),
        studentData.date_naissance
      ))
    } catch (error) {
      console.error('Error getting all students:', error)
      throw new Error('Database error occurred while fetching students')
    }
  }

  async save(etudiant: Etudiant): Promise<void> {
    try {
      // Check if student exists
      const existingStudent = await this.findById(etudiant.getId())
      if (existingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('etudiant')
          .update({
            firstname: etudiant.getFirstname(),
            lastname: etudiant.getLastname(),
            email: etudiant.getEmailValue(),
            classe_id: etudiant.getClasseId(),
            numero_etudiant: etudiant.getNumeroEtudiantValue(),
            date_naissance: etudiant.getDateNaissance(),
            updated_at: new Date().toISOString()
          })
          .eq('id', etudiant.getId())
        if (error) {
          if (error.code === '23505' || error.message.includes('duplicate')) {
            throw new Error('A student with this email or student number already exists')
          }
          throw error
        }
      } else {
        // Insert new student
        const { error } = await supabase
          .from('etudiant')
          .insert([
            {
              id: etudiant.getId(),
              firstname: etudiant.getFirstname(),
              lastname: etudiant.getLastname(),
              email: etudiant.getEmailValue(),
              classe_id: etudiant.getClasseId(),
              numero_etudiant: etudiant.getNumeroEtudiantValue(),
              date_naissance: etudiant.getDateNaissance()
            }
          ])
        if (error) {
          if (error.code === '23505' || error.message.includes('duplicate')) {
            throw new Error('A student with this email or student number already exists')
          }
          throw error
        }
      }
    } catch (error) {
      console.error('Error saving student:', error)
      throw new Error('Database error occurred while saving student')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('etudiant')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting student:', error)
      throw new Error('Database error occurred while deleting student')
    }
  }

  async getStudentStats(): Promise<{ total: number, byClasse: { [key: string]: number } }> {
    try {
      // Get total count
      const { data: totalRows, error: totalError } = await supabase
        .from('etudiant')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', 1)
      if (totalError) throw totalError
      const total = totalRows?.length || 0

      // Get count by class
      const { data: classRows, error: classError } = await supabase
        .from('etudiant')
        .select('classe_id')
        .eq('is_active', 1)
      if (classError) throw classError
      const byClasse: { [key: string]: number } = {}
      if (classRows) {
        for (const row of classRows) {
          const key = row.classe_id ? String(row.classe_id) : 'Unknown'
          byClasse[key] = (byClasse[key] || 0) + 1
        }
      }
      return { total, byClasse }
    } catch (error) {
      console.error('Error getting student stats:', error)
      throw new Error('Database error occurred while fetching student statistics')
    }
  }
} 