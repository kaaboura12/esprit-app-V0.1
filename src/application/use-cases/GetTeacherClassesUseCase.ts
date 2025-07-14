import { TeacherClasse } from '@/core/entities/TeacherClasse'
import { Classe } from '@/core/entities/Classe'
import { Matiere } from '@/core/entities/Matiere'

/**
 * Teacher Class Assignment with related data
 */
export interface TeacherClassAssignment {
  teacherClasse: TeacherClasse
  classe: Classe
  matiere: Matiere
}

/**
 * Repository interface for teacher class assignments
 */
export interface TeacherClassRepository {
  findByTeacherId(teacherId: number): Promise<TeacherClassAssignment[]>
}

/**
 * Use Case - Application layer
 * This use case gets all class assignments for a specific teacher
 */
export class GetTeacherClassesUseCase {
  constructor(private teacherClassRepository: TeacherClassRepository) {}

  async execute(teacherId: number): Promise<TeacherClassAssignment[]> {
    if (teacherId <= 0) {
      throw new Error('Teacher ID must be positive')
    }

    try {
      const assignments = await this.teacherClassRepository.findByTeacherId(teacherId)
      
      // Sort assignments by class name for consistent ordering
      return assignments.sort((a, b) => 
        a.classe.getNomClasse().localeCompare(b.classe.getNomClasse())
      )
    } catch (error) {
      throw new Error(`Failed to get teacher classes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 