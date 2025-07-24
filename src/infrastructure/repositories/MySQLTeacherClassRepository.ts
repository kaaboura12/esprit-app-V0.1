import { TeacherClassRepository, TeacherClassAssignment } from '@/application/use-cases/GetTeacherClassesUseCase'
import { TeacherClasse } from '@/core/entities/TeacherClasse'
import { Classe } from '@/core/entities/Classe'
import { Matiere } from '@/core/entities/Matiere'
import { supabase } from '@/infrastructure/config/database'

/**
 * Supabase Repository - Infrastructure layer
 * This repository handles teacher class assignments with Supabase database
 */
export class MySQLTeacherClassRepository implements TeacherClassRepository {
  async findByTeacherId(teacherId: number): Promise<TeacherClassAssignment[]> {
    try {
      // Fetch teacher_classe assignments for the teacher
      const { data: teacherClasses, error } = await supabase
        .from('teacher_classe')
        .select('id, teacher_id, classe_id, matiere_id')
        .eq('teacher_id', teacherId)
      if (error) throw error
      if (!teacherClasses || teacherClasses.length === 0) return []
      // Fetch all related classe and matiere in parallel
      const classeIds = teacherClasses.map(tc => tc.classe_id)
      const matiereIds = teacherClasses.map(tc => tc.matiere_id)
      const [{ data: classes }, { data: matieres }] = await Promise.all([
        supabase.from('classe').select('id, nom_classe, bloc, numclasse, nbre_etudiant_max, nbre_etudiant_actuel').in('id', classeIds),
        supabase.from('matiere').select('id, nommatiere, description, coefficient').in('id', matiereIds)
      ])
      return teacherClasses
        .map(tc => {
          // Create TeacherClasse entity
          const teacherClasse = TeacherClasse.create(
            tc.id,
            tc.teacher_id,
            tc.classe_id,
            tc.matiere_id
          )
          // Create Classe entity
          const classeData = classes?.find(c => c.id === tc.classe_id)
          if (!classeData) throw new Error(`Classe not found for id ${tc.classe_id}`)
          const classe = Classe.create(
            classeData.id,
            classeData.nom_classe,
            classeData.bloc,
            classeData.numclasse,
            classeData.nbre_etudiant_max,
            classeData.nbre_etudiant_actuel
          )
          // Create Matiere entity
          const matiereData = matieres?.find(m => m.id === tc.matiere_id)
          if (!matiereData) throw new Error(`Matiere not found for id ${tc.matiere_id}`)
          const matiere = Matiere.create(
            matiereData.id,
            matiereData.nommatiere,
            matiereData.description,
            matiereData.coefficient
          )
          return {
            teacherClasse,
            classe,
            matiere
          }
        })
    } catch (error) {
      throw new Error(`Failed to fetch teacher classes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}