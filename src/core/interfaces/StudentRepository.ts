import { Etudiant } from "../entities/Etudiant"
import { Email } from "../value-objects/Email"
import { StudentNumber } from "../value-objects/StudentNumber"

/**
 * Student Repository Interface - Core business logic
 * This defines the contract for student data operations
 * Implementation will be in the infrastructure layer
 */
export interface StudentRepository {
  findById(id: number): Promise<Etudiant | null>
  findByEmail(email: Email): Promise<Etudiant | null>
  findByStudentNumber(studentNumber: StudentNumber): Promise<Etudiant | null>
  findByClasseId(classeId: number): Promise<Etudiant[]>
  findAll(): Promise<Etudiant[]>
  create(etudiant: Etudiant): Promise<Etudiant>
  save(etudiant: Etudiant): Promise<void>
  delete(id: number): Promise<void>
  getStudentStats(): Promise<{
    total: number
    byClasse: { [key: string]: number }
  }>
} 