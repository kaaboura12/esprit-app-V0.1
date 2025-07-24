import { NotesRepository } from "@/core/interfaces/NotesRepository"
import { NoteFinale } from "@/core/entities/NoteFinale"
import { NoteConfig } from "@/core/entities/NoteConfig"
import { Etudiant } from "@/core/entities/Etudiant"
import { Matiere } from "@/core/entities/Matiere"
import { Classe } from "@/core/entities/Classe"
import { Email } from "@/core/value-objects/Email"
import { StudentNumber } from "@/core/value-objects/StudentNumber"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Notes Repository Implementation - Infrastructure layer
 * This implements the NotesRepository interface with Supabase database storage
 */
export class MySQLNotesRepository implements NotesRepository {
  // No constructor needed for Supabase

  async findNoteByStudentAndSubject(etudiantId: number, matiereId: number): Promise<NoteFinale | null> {
    try {
      const { data, error } = await supabase
        .from('note_finale')
        .select('id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale')
        .eq('etudiant_id', etudiantId)
        .eq('matiere_id', matiereId)
        .maybeSingle()
      if (error) {
        console.error('Error finding note by student and subject:', error)
        throw new Error('Database error occurred while finding note')
      }
      if (!data) return null
      return new NoteFinale(
        data.id,
        data.etudiant_id,
        data.matiere_id,
        data.teacher_id,
        data.note_cc ? Number(data.note_cc) : null,
        data.note_tp ? Number(data.note_tp) : null,
        data.note_dv ? Number(data.note_dv) : null,
        data.note_finale ? Number(data.note_finale) : null
      )
    } catch (error) {
      console.error('Error finding note by student and subject:', error)
      throw new Error('Database error occurred while finding note')
    }
  }

  async findNotesBySubjectAndClass(matiereId: number, classeId: number): Promise<NoteFinale[]> {
    try {
      // Supabase does not support joins directly, so we fetch all notes for the subject, then filter by class
      const { data: notes, error } = await supabase
        .from('note_finale')
        .select('id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale, etudiant:etudiant_id(classe_id)')
        .eq('matiere_id', matiereId)
      if (error) {
        console.error('Error finding notes by subject and class:', error)
        throw new Error('Database error occurred while finding notes')
      }
      if (!notes) return []
      return notes
        .filter(note => {
          const etudiant: any = note.etudiant;
          if (Array.isArray(etudiant)) {
            return etudiant.length > 0 && etudiant[0] && etudiant[0].classe_id === classeId
          } else {
            return etudiant && etudiant.classe_id === classeId
          }
        })
        .map(noteData => new NoteFinale(
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
      const { data, error } = await supabase
        .from('note_finale')
        .insert([
          {
            etudiant_id: note.getEtudiantId(),
            matiere_id: note.getMatiereId(),
            teacher_id: note.getTeacherId(),
            note_cc: note.getNoteCC(),
            note_tp: note.getNoteTP(),
            note_dv: note.getNoteDV()
          }
        ])
        .select('*')
        .single()
      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate')) {
          throw new Error('Note already exists for this student and subject')
        }
        throw new Error('Database error occurred while saving note')
      }
      return new NoteFinale(
        data.id,
        data.etudiant_id,
        data.matiere_id,
        data.teacher_id,
        data.note_cc ? Number(data.note_cc) : null,
        data.note_tp ? Number(data.note_tp) : null,
        data.note_dv ? Number(data.note_dv) : null,
        data.note_finale ? Number(data.note_finale) : null
      )
    } catch (error) {
      console.error('Error saving note:', error)
      throw error
    }
  }

  async updateNote(note: NoteFinale): Promise<NoteFinale> {
    try {
      const { error } = await supabase
        .from('note_finale')
        .update({
          note_cc: note.getNoteCC(),
          note_tp: note.getNoteTP(),
          note_dv: note.getNoteDV()
        })
        .eq('id', note.getId())
      if (error) {
        console.error('Error updating note:', error)
        throw new Error('Database error occurred while updating note')
      }
      // Fetch the updated note
      const updated = await this.findNoteById(note.getId())
      if (!updated) throw new Error('Updated note not found')
      return updated
    } catch (error) {
      console.error('Error updating note:', error)
      throw new Error('Database error occurred while updating note')
    }
  }

  async deleteNote(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_finale')
        .delete()
        .eq('id', id)
      if (error) {
        console.error('Error deleting note:', error)
        throw new Error('Database error occurred while deleting note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      throw new Error('Database error occurred while deleting note')
    }
  }

  async batchUpdateNotes(notes: NoteFinale[]): Promise<NoteFinale[]> {
    // Supabase does not support transactions or batch upserts in the same way as MySQL
    // We'll upsert one by one
    try {
      const updatedNotes: NoteFinale[] = []
      for (const note of notes) {
        if (note.getId() === 0) {
          // Create new note
          const saved = await this.saveNote(note)
          if (saved) updatedNotes.push(saved)
        } else {
          // Update existing note
          const updated = await this.updateNote(note)
          if (updated) updatedNotes.push(updated)
        }
      }
      return updatedNotes
    } catch (error) {
      console.error('Error batch updating notes:', error)
      throw new Error('Database error occurred while batch updating notes')
    }
  }

  async findNoteById(id: number): Promise<NoteFinale | null> {
    try {
      const { data, error } = await supabase
        .from('note_finale')
        .select('id, etudiant_id, matiere_id, teacher_id, note_cc, note_tp, note_dv, note_finale')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.error('Error finding note by ID:', error)
        throw new Error('Database error occurred while finding note')
      }
      if (!data) return null
      return new NoteFinale(
        data.id,
        data.etudiant_id,
        data.matiere_id,
        data.teacher_id,
        data.note_cc ? Number(data.note_cc) : null,
        data.note_tp ? Number(data.note_tp) : null,
        data.note_dv ? Number(data.note_dv) : null,
        data.note_finale ? Number(data.note_finale) : null
      )
    } catch (error) {
      console.error('Error finding note by ID:', error)
      throw new Error('Database error occurred while finding note')
    }
  }

  async findNoteConfigBySubject(matiereId: number): Promise<NoteConfig | null> {
    try {
      const { data, error } = await supabase
        .from('note_config')
        .select('id, matiere_id, pourcentage_cc, pourcentage_tp, pourcentage_dv')
        .eq('matiere_id', matiereId)
        .maybeSingle()
      if (error) {
        console.error('Error finding note config by subject:', error)
        throw new Error('Database error occurred while finding note config')
      }
      if (!data) return null
      return new NoteConfig(
        data.id,
        data.matiere_id,
        Number(data.pourcentage_cc),
        Number(data.pourcentage_tp),
        Number(data.pourcentage_dv)
      )
    } catch (error) {
      console.error('Error finding note config by subject:', error)
      throw new Error('Database error occurred while finding note config')
    }
  }

  async saveNoteConfig(config: NoteConfig): Promise<NoteConfig> {
    try {
      // Upsert by matiere_id
      const { data, error } = await supabase
        .from('note_config')
        .upsert([
          {
            id: config.getId() || undefined,
            matiere_id: config.getMatiereId(),
            pourcentage_cc: config.getPourcentageCC(),
            pourcentage_tp: config.getPourcentageTP(),
            pourcentage_dv: config.getPourcentageDV()
          }
        ], { onConflict: 'matiere_id' })
        .select('*')
        .single()
      if (error) {
        console.error('Error saving note config:', error)
        throw new Error('Database error occurred while saving note config')
      }
      return new NoteConfig(
        data.id,
        data.matiere_id,
        Number(data.pourcentage_cc),
        Number(data.pourcentage_tp),
        Number(data.pourcentage_dv)
      )
    } catch (error) {
      console.error('Error saving note config:', error)
      throw new Error('Database error occurred while saving note config')
    }
  }

  async findStudentsByClass(classeId: number): Promise<Etudiant[]> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('classe_id', classeId)
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true })
      if (error) {
        console.error('Error finding students by class:', error)
        throw new Error('Database error occurred while finding students')
      }
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
      console.error('Error finding students by class:', error)
      throw new Error('Database error occurred while finding students')
    }
  }

  async findStudentById(id: number): Promise<Etudiant | null> {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select('id, firstname, lastname, email, classe_id, numero_etudiant, date_naissance')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.error('Error finding student by ID:', error)
        throw new Error('Database error occurred while finding student')
      }
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

  async findSubjectById(id: number): Promise<Matiere | null> {
    try {
      const { data, error } = await supabase
        .from('matiere')
        .select('id, nommatiere, description, coefficient')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.error('Error finding subject by ID:', error)
        throw new Error('Database error occurred while finding subject')
      }
      if (!data) return null
      return new Matiere(
        data.id,
        data.nommatiere,
        data.description,
        data.coefficient
      )
    } catch (error) {
      console.error('Error finding subject by ID:', error)
      throw new Error('Database error occurred while finding subject')
    }
  }

  async findSubjectsByTeacher(teacherId: number): Promise<Matiere[]> {
    try {
      // Supabase does not support joins directly, so we fetch teacher_matiere and then matiere
      const { data: teacherMatieres, error } = await supabase
        .from('teacher_matiere')
        .select('matiere_id')
        .eq('teacher_id', teacherId)
      if (error) {
        console.error('Error finding subjects by teacher:', error)
        throw new Error('Database error occurred while finding subjects')
      }
      if (!teacherMatieres || teacherMatieres.length === 0) return []
      const matiereIds = teacherMatieres.map(tm => tm.matiere_id)
      const { data: matieres, error: matieresError } = await supabase
        .from('matiere')
        .select('id, nommatiere, description, coefficient')
        .in('id', matiereIds)
        .order('nommatiere', { ascending: true })
      if (matieresError) {
        console.error('Error finding subjects by teacher:', matieresError)
        throw new Error('Database error occurred while finding subjects')
      }
      if (!matieres) return []
      return matieres.map(subjectData => new Matiere(
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
      const { data, error } = await supabase
        .from('classe')
        .select('id, nom_classe, bloc, numclasse, nbre_etudiant_max, nbre_etudiant_actuel')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.error('Error finding class by ID:', error)
        throw new Error('Database error occurred while finding class')
      }
      if (!data) return null
      return new Classe(
        data.id,
        data.nom_classe,
        data.bloc,
        data.numclasse,
        data.nbre_etudiant_max,
        data.nbre_etudiant_actuel
      )
    } catch (error) {
      console.error('Error finding class by ID:', error)
      throw new Error('Database error occurred while finding class')
    }
  }

  async findClassesByTeacherAndSubject(teacherId: number, matiereId: number): Promise<Classe[]> {
    try {
      // Supabase does not support joins directly, so we fetch teacher_classe and then classe
      const { data: teacherClasses, error } = await supabase
        .from('teacher_classe')
        .select('classe_id')
        .eq('teacher_id', teacherId)
        .eq('matiere_id', matiereId)
      if (error) {
        console.error('Error finding classes by teacher and subject:', error)
        throw new Error('Database error occurred while finding classes')
      }
      if (!teacherClasses || teacherClasses.length === 0) return []
      const classeIds = teacherClasses.map(tc => tc.classe_id)
      const { data: classes, error: classesError } = await supabase
        .from('classe')
        .select('id, nom_classe, bloc, numclasse, nbre_etudiant_max, nbre_etudiant_actuel')
        .in('id', classeIds)
        .order('nom_classe', { ascending: true })
        .order('numclasse', { ascending: true })
      if (classesError) {
        console.error('Error finding classes by teacher and subject:', classesError)
        throw new Error('Database error occurred while finding classes')
      }
      if (!classes) return []
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
      const { data: totalStudentsData, error: totalError } = await supabase
        .from('etudiant')
        .select('id', { count: 'exact', head: true })
        .eq('classe_id', classeId)
      if (totalError) {
        console.error('Error getting total students:', totalError)
        throw new Error('Database error occurred while getting statistics')
      }
      const totalStudents = totalStudentsData?.length || 0

      // Get all notes for the subject and class
      const { data: notes, error: notesError } = await supabase
        .from('note_finale')
        .select('id, etudiant_id, note_finale, etudiant:etudiant_id(classe_id)')
        .eq('matiere_id', matiereId)
      if (notesError) {
        console.error('Error getting notes statistics:', notesError)
        throw new Error('Database error occurred while getting statistics')
      }
      if (!notes) return {
        totalStudents,
        studentsWithNotes: 0,
        averageGrade: null,
        passRate: 0,
        completionRate: 0
      }
      const filteredNotes = notes.filter(note => {
        const etudiant: any = note.etudiant;
        if (Array.isArray(etudiant)) {
          return etudiant.length > 0 && etudiant[0] && etudiant[0].classe_id === classeId
        } else {
          return etudiant && etudiant.classe_id === classeId
        }
      })
      const studentsWithNotes = filteredNotes.length
      const studentsWithFinalGrades = filteredNotes.filter(n => n.note_finale !== null && n.note_finale !== undefined).length
      const averageGrade = studentsWithFinalGrades > 0 ? Math.round(filteredNotes.reduce((sum, n) => sum + (n.note_finale || 0), 0) / studentsWithFinalGrades * 100) / 100 : null
      const passedStudents = filteredNotes.filter(n => n.note_finale !== null && n.note_finale >= 10).length
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
      // Supabase does not support joins directly, so we fetch teacher_classe, matiere, and classe separately
      const { data: teacherClasses, error } = await supabase
        .from('teacher_classe')
        .select('id, matiere_id, classe_id')
        .eq('teacher_id', teacherId)
      if (error) {
        console.error('Error finding teacher subject assignments:', error)
        throw new Error('Database error occurred while finding assignments')
      }
      if (!teacherClasses || teacherClasses.length === 0) return []
      // Fetch all matiere and classe in parallel
      const matiereIds = teacherClasses.map(tc => tc.matiere_id)
      const classeIds = teacherClasses.map(tc => tc.classe_id)
      const [{ data: matieres }, { data: classes }] = await Promise.all([
        supabase.from('matiere').select('id, nommatiere'),
        supabase.from('classe').select('id, nom_classe, bloc, numclasse, nbre_etudiant_actuel')
      ])
      return teacherClasses.map(tc => {
        const matiere = matieres?.find(m => m.id === tc.matiere_id)
        const classe = classes?.find(c => c.id === tc.classe_id)
        return {
          teacherClasseId: tc.id,
          matiereId: tc.matiere_id,
          classeId: tc.classe_id,
          subjectName: matiere?.nommatiere || '',
          className: classe?.nom_classe || '',
          bloc: classe?.bloc || '',
          numClasse: classe?.numclasse || 0,
          studentCount: classe?.nbre_etudiant_actuel || 0
        }
      })
    } catch (error) {
      console.error('Error finding teacher subject assignments:', error)
      throw new Error('Database error occurred while finding assignments')
    }
  }
} 