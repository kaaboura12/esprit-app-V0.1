import { StudentByTeacherDTO } from '../dtos/StudentByTeacherDTO'

export interface GetStudentsByTeacherRequest {
  teacherId: number
}

export interface GetStudentsByTeacherResponse {
  students: StudentByTeacherDTO[]
  total: number
  teacherId: number
}

export class GetStudentsByTeacherUseCase {
  constructor() {}

  async execute(request: GetStudentsByTeacherRequest): Promise<GetStudentsByTeacherResponse> {
    try {
      const { teacherId } = request

      if (!teacherId || teacherId <= 0) {
        throw new Error('Invalid teacher ID')
      }

      // This use case will be implemented by the infrastructure layer
      // For now, we'll return an empty response as the actual data fetching
      // will be handled by the API route directly
      return {
        students: [],
        total: 0,
        teacherId
      }
    } catch (error) {
      throw new Error(`Failed to get students by teacher: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
