import { TeacherDTO } from "@/application/dtos/TeacherDTO"

/**
 * Presentation Component - Presentation layer
 * This component handles UI logic and presentation for teachers
 */
interface TeacherProfileProps {
  teacher: TeacherDTO
  onEdit?: () => void
  onDelete?: () => void
}

export function TeacherProfile({ teacher, onEdit, onDelete }: TeacherProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-lg">
              {teacher.firstname.charAt(0).toUpperCase()}{teacher.lastname.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-900 truncate">
            {teacher.firstname} {teacher.lastname}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {teacher.email}
          </p>
          <p className="text-sm text-blue-600 font-medium truncate">
            {teacher.departement}
          </p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Teacher ID</p>
          <p className="text-sm font-medium text-gray-900">#{teacher.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
          <p className="text-sm font-medium text-gray-900">{teacher.departement}</p>
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
} 