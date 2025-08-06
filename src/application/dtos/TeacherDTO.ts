/**
 * Application DTOs - Data Transfer Objects
 * These are used to transfer data between layers
 */

export interface TeacherDTO {
  id: number
  firstname: string
  lastname: string
  email: string
  departement: string
  photoUrl?: string
  role: string
}

export interface CreateTeacherRequestDTO {
  firstname: string
  lastname: string
  email: string
  departement: string
  password: string
  photoUrl?: string
  role?: string
}

export interface UpdateTeacherRequestDTO {
  id: number
  firstname?: string
  lastname?: string
  email?: string
  departement?: string
  photoUrl?: string
  role?: string
}

export interface TeacherResponseDTO {
  id: number
  firstname: string
  lastname: string
  email: string
  departement: string
  fullName: string
  hasProfilePhoto: boolean
  photoUrl?: string
  role: string
}

export interface UpdatePhotoRequestDTO {
  teacherId: number
  photoUrl: string
}

export interface UpdatePhotoResponseDTO {
  success: boolean
  photoUrl?: string
  message?: string
  token?: string
  teacher?: {
    id: number
    firstname: string
    lastname: string
    email: string
    departement: string
    photoUrl?: string
    role: string
  }
}

export interface TeacherListResponseDTO {
  teachers: TeacherResponseDTO[]
  total: number
}

export interface TeacherStatsResponseDTO {
  total: number
  byDepartment: { [key: string]: number }
} 