import { Teacher } from "../entities/Teacher"

/**
 * Domain Repository Interface - Core business logic
 * This defines the contract for teacher data operations
 * Implementation will be in the infrastructure layer
 */
export interface TeacherRepository {
  findById(id: number): Promise<Teacher | null>
  findByIds(ids: number[]): Promise<Teacher[]>
  findByEmail(email: string): Promise<Teacher | null>
  save(teacher: Teacher): Promise<void>
  delete(id: number): Promise<void>
  findAll(): Promise<Teacher[]>
  findByDepartement(departement: string): Promise<Teacher[]>
  updatePhoto(teacherId: number, photoUrl: string): Promise<void>
} 