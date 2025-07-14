import { NoteFinale } from "../entities/NoteFinale"
import { NoteConfig } from "../entities/NoteConfig"
import { Etudiant } from "../entities/Etudiant"
import { Matiere } from "../entities/Matiere"
import { Classe } from "../entities/Classe"

/**
 * Domain Repository Interface - Core business logic
 * This defines the contract for notes data operations
 * Implementation will be in the infrastructure layer
 */
export interface NotesRepository {
  // Note operations
  findNoteByStudentAndSubject(etudiantId: number, matiereId: number): Promise<NoteFinale | null>
  findNotesBySubjectAndClass(matiereId: number, classeId: number): Promise<NoteFinale[]>
  saveNote(note: NoteFinale): Promise<NoteFinale>
  updateNote(note: NoteFinale): Promise<NoteFinale>
  deleteNote(id: number): Promise<void>
  batchUpdateNotes(notes: NoteFinale[]): Promise<NoteFinale[]>
  
  // Note configuration operations
  findNoteConfigBySubject(matiereId: number): Promise<NoteConfig | null>
  saveNoteConfig(config: NoteConfig): Promise<NoteConfig>
  
  // Student operations for notes
  findStudentsByClass(classeId: number): Promise<Etudiant[]>
  findStudentById(id: number): Promise<Etudiant | null>
  
  // Subject operations for notes
  findSubjectById(id: number): Promise<Matiere | null>
  findSubjectsByTeacher(teacherId: number): Promise<Matiere[]>
  
  // Class operations for notes
  findClassById(id: number): Promise<Classe | null>
  findClassesByTeacherAndSubject(teacherId: number, matiereId: number): Promise<Classe[]>
  
  // Statistics operations
  getNotesStatistics(matiereId: number, classeId: number): Promise<{
    totalStudents: number
    studentsWithNotes: number
    averageGrade: number | null
    passRate: number
    completionRate: number
  }>
  
  // Teacher subject assignments
  findTeacherSubjectAssignments(teacherId: number): Promise<{
    teacherClasseId: number
    matiereId: number
    classeId: number
    subjectName: string
    className: string
    bloc: string
    numClasse: number
    studentCount: number
  }[]>
} 