export interface StudentByTeacherDTO {
  student_id: number
  firstname: string
  lastname: string
  email: string
  numero_etudiant: string
  date_naissance: string
  classe_id: number
  nom_classe: string
  bloc: string
  numclasse: string
  subject_name: string
  matiere_id: number
}

export interface StudentsByTeacherResponseDTO {
  students: StudentByTeacherDTO[]
  total: number
  teacher_id: number
}
