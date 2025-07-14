import { TeacherClassRepository, TeacherClassAssignment } from '@/application/use-cases/GetTeacherClassesUseCase'
import { TeacherClasse } from '@/core/entities/TeacherClasse'
import { Classe } from '@/core/entities/Classe'
import { Matiere } from '@/core/entities/Matiere'
import { getConnectionPool } from '@/infrastructure/config/database'
import { RowDataPacket } from 'mysql2'

/**
 * MySQL Repository - Infrastructure layer
 * This repository handles teacher class assignments with MySQL database
 */
export class MySQLTeacherClassRepository implements TeacherClassRepository {
  
  async findByTeacherId(teacherId: number): Promise<TeacherClassAssignment[]> {
    const pool = getConnectionPool()
    
    try {
      const query = `
        SELECT 
          tc.id as teacher_classe_id,
          tc.teacher_id,
          tc.classe_id,
          tc.matiere_id,
          c.nom_classe,
          c.bloc,
          c.numclasse,
          c.nbre_etudiant_max,
          c.nbre_etudiant_actuel,
          m.nommatiere,
          m.description as matiere_description,
          m.coefficient
        FROM teacher_classe tc
        INNER JOIN classe c ON tc.classe_id = c.id
        INNER JOIN matiere m ON tc.matiere_id = m.id
        WHERE tc.teacher_id = ?
        ORDER BY c.nom_classe, m.nommatiere
      `
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, [teacherId])
      
      return rows.map(row => {
        // Create TeacherClasse entity
        const teacherClasse = TeacherClasse.create(
          row.teacher_classe_id,
          row.teacher_id,
          row.classe_id,
          row.matiere_id
        )
        
        // Create Classe entity
        const classe = Classe.create(
          row.classe_id,
          row.nom_classe,
          row.bloc,
          row.numclasse,
          row.nbre_etudiant_max,
          row.nbre_etudiant_actuel
        )
        
        // Create Matiere entity
        const matiere = Matiere.create(
          row.matiere_id,
          row.nommatiere,
          row.matiere_description,
          row.coefficient
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