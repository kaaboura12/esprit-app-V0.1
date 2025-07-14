import { StudentRepository } from "@/core/interfaces/StudentRepository"
import { Etudiant } from "@/core/entities/Etudiant"
import { Email } from "@/core/value-objects/Email"
import { StudentNumber } from "@/core/value-objects/StudentNumber"
import { getConnectionPool } from "@/infrastructure/config/database"
import mysql from 'mysql2/promise'

/**
 * MySQL Student Repository Implementation - Infrastructure layer
 * This implements the StudentRepository interface with MySQL database storage
 */
export class MySQLStudentRepository implements StudentRepository {
  private pool: mysql.Pool

  constructor() {
    this.pool = getConnectionPool()
  }

  async findById(id: number): Promise<Etudiant | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant WHERE id = ?',
        [id]
      )

      const students = rows as mysql.RowDataPacket[]
      
      if (students.length === 0) {
        return null
      }

      const studentData = students[0]
      
      const etudiant = new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        new Email(studentData.email),
        studentData.classe_id,
        new StudentNumber(studentData.numero_etudiant),
        studentData.date_naissance
      )

      return etudiant

    } catch (error) {
      console.error('Error finding student by ID:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async findByEmail(email: Email): Promise<Etudiant | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant WHERE email = ?',
        [email.getValue()]
      )

      const students = rows as mysql.RowDataPacket[]
      
      if (students.length === 0) {
        return null
      }

      const studentData = students[0]
      
      const etudiant = new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        email,
        studentData.classe_id,
        new StudentNumber(studentData.numero_etudiant),
        studentData.date_naissance
      )

      return etudiant

    } catch (error) {
      console.error('Error finding student by email:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async findByStudentNumber(studentNumber: StudentNumber): Promise<Etudiant | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant WHERE numero_etudiant = ?',
        [studentNumber.getValue()]
      )

      const students = rows as mysql.RowDataPacket[]
      
      if (students.length === 0) {
        return null
      }

      const studentData = students[0]
      
      const etudiant = new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        new Email(studentData.email),
        studentData.classe_id,
        studentNumber,
        studentData.date_naissance
      )

      return etudiant

    } catch (error) {
      console.error('Error finding student by student number:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async create(etudiant: Etudiant): Promise<Etudiant> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO etudiant (firstname, lastname, email, classe_id, numero_etudiant, date_naissance) VALUES (?, ?, ?, ?, ?, ?)',
        [
          etudiant.getFirstname(),
          etudiant.getLastname(),
          etudiant.getEmailValue(),
          etudiant.getClasseId(),
          etudiant.getNumeroEtudiantValue(),
          etudiant.getDateNaissance()
        ]
      )

      const insertResult = result as mysql.ResultSetHeader
      const newStudentId = insertResult.insertId

      // Return the created student with the new ID
      return new Etudiant(
        newStudentId,
        etudiant.getFirstname(),
        etudiant.getLastname(),
        new Email(etudiant.getEmailValue()),
        etudiant.getClasseId(),
        new StudentNumber(etudiant.getNumeroEtudiantValue()),
        etudiant.getDateNaissance()
      )

    } catch (error) {
      console.error('Error creating student:', error)
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('Un étudiant avec cet email ou ce numéro existe déjà')
      }
      throw new Error('Database error occurred while creating student')
    }
  }

  async findByClasseId(classeId: number): Promise<Etudiant[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant WHERE classe_id = ?  ORDER BY lastname, firstname',
        [classeId]
      )

      const students = rows as mysql.RowDataPacket[]
      
      return students.map(studentData => new Etudiant(
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
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant ORDER BY lastname, firstname'
      )

      const students = rows as mysql.RowDataPacket[]
      
      return students.map(studentData => new Etudiant(
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
        await this.pool.execute(
          'UPDATE etudiant SET firstname = ?, lastname = ?, email = ?, classe_id = ?, numero_etudiant = ?, date_naissance = ?, updated_at = NOW() WHERE id = ?',
          [
            etudiant.getFirstname(),
            etudiant.getLastname(),
            etudiant.getEmailValue(),
            etudiant.getClasseId(),
            etudiant.getNumeroEtudiantValue(),
            etudiant.getDateNaissance(),
            etudiant.getId()
          ]
        )
      } else {
        // Insert new student
        await this.pool.execute(
          'INSERT INTO etudiant (id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            etudiant.getId(),
            etudiant.getFirstname(),
            etudiant.getLastname(),
            etudiant.getEmailValue(),
            etudiant.getClasseId(),
            etudiant.getNumeroEtudiantValue(),
            etudiant.getDateNaissance()
          ]
        )
      }

    } catch (error) {
      console.error('Error saving student:', error)
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('A student with this email or student number already exists')
      }
      throw new Error('Database error occurred while saving student')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE etudiant SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      )

    } catch (error) {
      console.error('Error deleting student:', error)
      throw new Error('Database error occurred while deleting student')
    }
  }

  async getStudentStats(): Promise<{ total: number, byClasse: { [key: string]: number } }> {
    try {
      // Get total count
      const [totalRows] = await this.pool.execute(
        'SELECT COUNT(*) as total FROM etudiant WHERE is_active = 1'
      )
      const total = (totalRows as mysql.RowDataPacket[])[0].total

      // Get count by class
      const [classRows] = await this.pool.execute(
        'SELECT c.nom as classe_name, COUNT(e.id) as count FROM etudiant e LEFT JOIN classe c ON e.classe_id = c.id GROUP BY e.classe_id, c.nom ORDER BY c.nom'
      )

      const classes = classRows as mysql.RowDataPacket[]
      const byClasse: { [key: string]: number } = {}
      
      classes.forEach(row => {
        byClasse[row.classe_name || 'Unknown'] = row.count
      })

      return { total, byClasse }

    } catch (error) {
      console.error('Error getting student stats:', error)
      throw new Error('Database error occurred while fetching student statistics')
    }
  }
} 