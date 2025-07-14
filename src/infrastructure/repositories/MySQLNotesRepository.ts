import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { NoteFinale } from "@/core/entities/NoteFinale"
import { NoteConfig } from "@/core/entities/NoteConfig"
import { Etudiant } from "@/core/entities/Etudiant"
import { Matiere } from "@/core/entities/Matiere"
import { Classe } from "@/core/entities/Classe"
import { Email } from "@/core/value-objects/Email"
import { StudentNumber } from "@/core/value-objects/StudentNumber"
import { getConnectionPool } from "@/infrastructure/config/database"
import mysql from 'mysql2/promise'

/**
 * MySQL Notes Repository Implementation - Infrastructure layer
 * This implements the NotesRepository interface with MySQL database storage
 */
export class MySQLNotesRepository implements NotesRepository {
  private pool: mysql.Pool

  constructor() {
    this.pool = getConnectionPool()
  }

  async findNoteByStudentAndSubject(etudiantId: number, matiereId: number): Promise<NoteFinale | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale FROM note_finale WHERE etudiant_id = ? AND matiere_id = ?',
        [etudiantId, matiereId]
      )

      const notes = rows as mysql.RowDataPacket[]
      
      if (notes.length === 0) {
        return null
      }

      const noteData = notes[0]
      
      return new NoteFinale(
        noteData.id,
        noteData.etudiant_id,
        noteData.matiere_id,
        noteData.teacher_id,
        noteData.note_cc ? Number(noteData.note_cc) : null,
        noteData.note_tp ? Number(noteData.note_tp) : null,
        noteData.note_dv ? Number(noteData.note_dv) : null,
        noteData.note_finale ? Number(noteData.note_finale) : null
      )

    } catch (error) {
      console.error('Error finding note by student and subject:', error)
      throw new Error('Database error occurred while finding note')
    }
  }

  async findNotesBySubjectAndClass(matiereId: number, classeId: number): Promise<NoteFinale[]> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT nf.id, nf.etudiant_id, nf.matiere_id, nf.teacher_id, nf.note_cc, nf.note_tp, nf.note_dv, nf.note_finale
        FROM note_finale nf
        INNER JOIN etudiant e ON nf.etudiant_id = e.id
        WHERE nf.matiere_id = ? AND e.classe_id = ?
      `, [matiereId, classeId])

      const notes = rows as mysql.RowDataPacket[]
      
      return notes.map(noteData => new NoteFinale(
        noteData.id,
        noteData.etudiant_id,
        noteData.matiere_id,
        noteData.teacher_id,
        noteData.note_cc ? Number(noteData.note_cc) : null,
        noteData.note_tp ? Number(noteData.note_tp) : null,
        noteData.note_dv ? Number(noteData.note_dv) : null,
        noteData.note_finale ? Number(noteData.note_finale) : null
      ))

    } catch (error) {
      console.error('Error finding notes by subject and class:', error)
      throw new Error('Database error occurred while finding notes')
    }
  }

  async saveNote(note: NoteFinale): Promise<NoteFinale> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO note_finale (etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv) VALUES (?, ?, ?, ?, ?, ?)',
        [
          note.getEtudiantId(),
          note.getMatiereId(),
          note.getTeacherId(),
          note.getNoteCC(),
          note.getNoteTP(),
          note.getNoteDV()
        ]
      )

      const insertResult = result as mysql.ResultSetHeader
      const noteId = insertResult.insertId

      // Fetch the created note with calculated final grade
      const [rows] = await this.pool.execute(
        'SELECT id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale FROM note_finale WHERE id = ?',
        [noteId]
      )

      const noteData = (rows as mysql.RowDataPacket[])[0]
      
      return new NoteFinale(
        noteData.id,
        noteData.etudiant_id,
        noteData.matiere_id,
        noteData.teacher_id,
        noteData.note_cc ? Number(noteData.note_cc) : null,
        noteData.note_tp ? Number(noteData.note_tp) : null,
        noteData.note_dv ? Number(noteData.note_dv) : null,
        noteData.note_finale ? Number(noteData.note_finale) : null
      )

    } catch (error) {
      console.error('Error saving note:', error)
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('Note already exists for this student and subject')
      }
      throw new Error('Database error occurred while saving note')
    }
  }

  async updateNote(note: NoteFinale): Promise<NoteFinale> {
    try {
      await this.pool.execute(
        'UPDATE note_finale SET note_cc = ?, note_tp = ?, note_dv = ? WHERE id = ?',
        [
          note.getNoteCC(),
          note.getNoteTP(),
          note.getNoteDV(),
          note.getId()
        ]
      )

      // Fetch the updated note with recalculated final grade
      const [rows] = await this.pool.execute(
        'SELECT id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale FROM note_finale WHERE id = ?',
        [note.getId()]
      )

      const noteData = (rows as mysql.RowDataPacket[])[0]
      
      return new NoteFinale(
        noteData.id,
        noteData.etudiant_id,
        noteData.matiere_id,
        noteData.teacher_id,
        noteData.note_cc ? Number(noteData.note_cc) : null,
        noteData.note_tp ? Number(noteData.note_tp) : null,
        noteData.note_dv ? Number(noteData.note_dv) : null,
        noteData.note_finale ? Number(noteData.note_finale) : null
      )

    } catch (error) {
      console.error('Error updating note:', error)
      throw new Error('Database error occurred while updating note')
    }
  }

  async deleteNote(id: number): Promise<void> {
    try {
      await this.pool.execute('DELETE FROM note_finale WHERE id = ?', [id])
    } catch (error) {
      console.error('Error deleting note:', error)
      throw new Error('Database error occurred while deleting note')
    }
  }

  async batchUpdateNotes(notes: NoteFinale[]): Promise<NoteFinale[]> {
    const connection = await this.pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const updatedNotes: NoteFinale[] = []
      
      for (const note of notes) {
        if (note.getId() === 0) {
          // Create new note
          const [result] = await connection.execute(
            'INSERT INTO note_finale (etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE note_cc = VALUES(note_cc), note_tp = VALUES(note_tp), note_dv = VALUES(note_dv)',
            [
              note.getEtudiantId(),
              note.getMatiereId(),
              note.getTeacherId(),
              note.getNoteCC(),
              note.getNoteTP(),
              note.getNoteDV()
            ]
          )
          
          const insertResult = result as mysql.ResultSetHeader
          const noteId = insertResult.insertId || await this.findExistingNoteId(connection, note.getEtudiantId(), note.getMatiereId())
          
          const [rows] = await connection.execute(
            'SELECT id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale FROM note_finale WHERE id = ?',
            [noteId]
          )
          
          const noteData = (rows as mysql.RowDataPacket[])[0]
          updatedNotes.push(new NoteFinale(
            noteData.id,
            noteData.etudiant_id,
            noteData.matiere_id,
            noteData.teacher_id,
            noteData.note_cc ? Number(noteData.note_cc) : null,
            noteData.note_tp ? Number(noteData.note_tp) : null,
            noteData.note_dv ? Number(noteData.note_dv) : null,
            noteData.note_finale ? Number(noteData.note_finale) : null
          ))
        } else {
          // Update existing note
          await connection.execute(
            'UPDATE note_finale SET note_cc = ?, note_tp = ?, note_dv = ? WHERE id = ?',
            [
              note.getNoteCC(),
              note.getNoteTP(),
              note.getNoteDV(),
              note.getId()
            ]
          )
          
          const [rows] = await connection.execute(
            'SELECT id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale FROM note_finale WHERE id = ?',
            [note.getId()]
          )
          
          const noteData = (rows as mysql.RowDataPacket[])[0]
          updatedNotes.push(new NoteFinale(
            noteData.id,
            noteData.etudiant_id,
            noteData.matiere_id,
            noteData.teacher_id,
            noteData.note_cc ? Number(noteData.note_cc) : null,
            noteData.note_tp ? Number(noteData.note_tp) : null,
            noteData.note_dv ? Number(noteData.note_dv) : null,
            noteData.note_finale ? Number(noteData.note_finale) : null
          ))
        }
      }
      
      await connection.commit()
      return updatedNotes
      
    } catch (error) {
      await connection.rollback()
      console.error('Error batch updating notes:', error)
      throw new Error('Database error occurred while batch updating notes')
    } finally {
      connection.release()
    }
  }

  private async findExistingNoteId(connection: mysql.PoolConnection, etudiantId: number, matiereId: number): Promise<number> {
    const [rows] = await connection.execute(
      'SELECT id FROM note_finale WHERE etudiant_id = ? AND matiere_id = ?',
      [etudiantId, matiereId]
    )
    
    const notes = rows as mysql.RowDataPacket[]
    return notes.length > 0 ? notes[0].id : 0
  }

  async findNoteConfigBySubject(matiereId: number): Promise<NoteConfig | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, matiere_id, pourcentage_cc, pourcentage_tp, pourcentage_dv FROM note_config WHERE matiere_id = ?',
        [matiereId]
      )

      const configs = rows as mysql.RowDataPacket[]
      
      if (configs.length === 0) {
        return null
      }

      const configData = configs[0]
      
      return new NoteConfig(
        configData.id,
        configData.matiere_id,
        Number(configData.pourcentage_cc),
        Number(configData.pourcentage_tp),
        Number(configData.pourcentage_dv)
      )

    } catch (error) {
      console.error('Error finding note config by subject:', error)
      throw new Error('Database error occurred while finding note config')
    }
  }

  async saveNoteConfig(config: NoteConfig): Promise<NoteConfig> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO note_config (matiere_id, pourcentage_cc, pourcentage_tp, pourcentage_dv) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pourcentage_cc = VALUES(pourcentage_cc), pourcentage_tp = VALUES(pourcentage_tp), pourcentage_dv = VALUES(pourcentage_dv)',
        [
          config.getMatiereId(),
          config.getPourcentageCC(),
          config.getPourcentageTP(),
          config.getPourcentageDV()
        ]
      )

      const insertResult = result as mysql.ResultSetHeader
      const configId = insertResult.insertId || config.getId()

      const [rows] = await this.pool.execute(
        'SELECT id, matiere_id, pourcentage_cc, pourcentage_tp, pourcentage_dv FROM note_config WHERE id = ?',
        [configId]
      )

      const configData = (rows as mysql.RowDataPacket[])[0]
      
      return new NoteConfig(
        configData.id,
        configData.matiere_id,
        Number(configData.pourcentage_cc),
        Number(configData.pourcentage_tp),
        Number(configData.pourcentage_dv)
      )

    } catch (error) {
      console.error('Error saving note config:', error)
      throw new Error('Database error occurred while saving note config')
    }
  }

  async findStudentsByClass(classeId: number): Promise<Etudiant[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance FROM etudiant WHERE classe_id = ? ORDER BY lastname, firstname',
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
      console.error('Error finding students by class:', error)
      throw new Error('Database error occurred while finding students')
    }
  }

  async findStudentById(id: number): Promise<Etudiant | null> {
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
      
      return new Etudiant(
        studentData.id,
        studentData.firstname,
        studentData.lastname,
        new Email(studentData.email),
        studentData.classe_id,
        new StudentNumber(studentData.numero_etudiant),
        studentData.date_naissance
      )

    } catch (error) {
      console.error('Error finding student by ID:', error)
      throw new Error('Database error occurred while finding student')
    }
  }

  async findSubjectById(id: number): Promise<Matiere | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, nommatiere, description, coefficient FROM matiere WHERE id = ?',
        [id]
      )

      const subjects = rows as mysql.RowDataPacket[]
      
      if (subjects.length === 0) {
        return null
      }

      const subjectData = subjects[0]
      
      return new Matiere(
        subjectData.id,
        subjectData.nommatiere,
        subjectData.description,
        subjectData.coefficient
      )

    } catch (error) {
      console.error('Error finding subject by ID:', error)
      throw new Error('Database error occurred while finding subject')
    }
  }

  async findSubjectsByTeacher(teacherId: number): Promise<Matiere[]> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT DISTINCT m.id, m.nommatiere, m.description, m.coefficient
        FROM matiere m
        INNER JOIN teacher_matiere tm ON m.id = tm.matiere_id
        WHERE tm.teacher_id = ?
        ORDER BY m.nommatiere
      `, [teacherId])

      const subjects = rows as mysql.RowDataPacket[]
      
      return subjects.map(subjectData => new Matiere(
        subjectData.id,
        subjectData.nommatiere,
        subjectData.description,
        subjectData.coefficient
      ))

    } catch (error) {
      console.error('Error finding subjects by teacher:', error)
      throw new Error('Database error occurred while finding subjects')
    }
  }

  async findClassById(id: number): Promise<Classe | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, nom_classe, bloc, numclasse, nbre_etudiant_max, nbre_etudiant_actuel FROM classe WHERE id = ?',
        [id]
      )

      const classes = rows as mysql.RowDataPacket[]
      
      if (classes.length === 0) {
        return null
      }

      const classData = classes[0]
      
      return new Classe(
        classData.id,
        classData.nom_classe,
        classData.bloc,
        classData.numclasse,
        classData.nbre_etudiant_max,
        classData.nbre_etudiant_actuel
      )

    } catch (error) {
      console.error('Error finding class by ID:', error)
      throw new Error('Database error occurred while finding class')
    }
  }

  async findClassesByTeacherAndSubject(teacherId: number, matiereId: number): Promise<Classe[]> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT DISTINCT c.id, c.nom_classe, c.bloc, c.numclasse, c.nbre_etudiant_max, c.nbre_etudiant_actuel
        FROM classe c
        INNER JOIN teacher_classe tc ON c.id = tc.classe_id
        WHERE tc.teacher_id = ? AND tc.matiere_id = ?
        ORDER BY c.nom_classe, c.numclasse
      `, [teacherId, matiereId])

      const classes = rows as mysql.RowDataPacket[]
      
      return classes.map(classData => new Classe(
        classData.id,
        classData.nom_classe,
        classData.bloc,
        classData.numclasse,
        classData.nbre_etudiant_max,
        classData.nbre_etudiant_actuel
      ))

    } catch (error) {
      console.error('Error finding classes by teacher and subject:', error)
      throw new Error('Database error occurred while finding classes')
    }
  }

  async getNotesStatistics(matiereId: number, classeId: number): Promise<{
    totalStudents: number
    studentsWithNotes: number
    averageGrade: number | null
    passRate: number
    completionRate: number
  }> {
    try {
      // Get total students in class
      const [totalRows] = await this.pool.execute(
        'SELECT COUNT(*) as total FROM etudiant WHERE classe_id = ?',
        [classeId]
      )
      const totalStudents = (totalRows as mysql.RowDataPacket[])[0].total

      // Get students with notes
      const [notesRows] = await this.pool.execute(`
        SELECT 
          COUNT(*) as students_with_notes,
          COUNT(CASE WHEN note_finale IS NOT NULL THEN 1 END) as students_with_final_grades,
          AVG(CASE WHEN note_finale IS NOT NULL THEN note_finale END) as average_grade,
          COUNT(CASE WHEN note_finale >= 10 THEN 1 END) as passed_students
        FROM note_finale nf
        INNER JOIN etudiant e ON nf.etudiant_id = e.id
        WHERE nf.matiere_id = ? AND e.classe_id = ?
      `, [matiereId, classeId])

      const stats = (notesRows as mysql.RowDataPacket[])[0]

      const studentsWithNotes = stats.students_with_notes || 0
      const studentsWithFinalGrades = stats.students_with_final_grades || 0
      const averageGrade = stats.average_grade ? Math.round(stats.average_grade * 100) / 100 : null
      const passedStudents = stats.passed_students || 0

      return {
        totalStudents,
        studentsWithNotes,
        averageGrade,
        passRate: studentsWithFinalGrades > 0 ? Math.round((passedStudents / studentsWithFinalGrades) * 100) : 0,
        completionRate: totalStudents > 0 ? Math.round((studentsWithNotes / totalStudents) * 100) : 0
      }

    } catch (error) {
      console.error('Error getting notes statistics:', error)
      throw new Error('Database error occurred while getting statistics')
    }
  }

  async findTeacherSubjectAssignments(teacherId: number): Promise<{
    teacherClasseId: number
    matiereId: number
    classeId: number
    subjectName: string
    className: string
    bloc: string
    numClasse: number
    studentCount: number
  }[]> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT 
          tc.id as teacher_classe_id,
          tc.matiere_id,
          tc.classe_id,
          m.nommatiere as subject_name,
          c.nom_classe as class_name,
          c.bloc,
          c.numclasse,
          c.nbre_etudiant_actuel as student_count
        FROM teacher_classe tc
        INNER JOIN matiere m ON tc.matiere_id = m.id
        INNER JOIN classe c ON tc.classe_id = c.id
        WHERE tc.teacher_id = ?
        ORDER BY m.nommatiere, c.nom_classe, c.numclasse
      `, [teacherId])

      const assignments = rows as mysql.RowDataPacket[]
      
      return assignments.map(assignment => ({
        teacherClasseId: assignment.teacher_classe_id,
        matiereId: assignment.matiere_id,
        classeId: assignment.classe_id,
        subjectName: assignment.subject_name,
        className: assignment.class_name,
        bloc: assignment.bloc,
        numClasse: assignment.numclasse,
        studentCount: assignment.student_count
      }))

    } catch (error) {
      console.error('Error finding teacher subject assignments:', error)
      throw new Error('Database error occurred while finding assignments')
    }
  }
} 