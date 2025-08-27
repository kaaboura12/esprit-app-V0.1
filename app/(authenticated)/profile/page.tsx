"use client"

import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Edit3,
  Briefcase,
  GraduationCap,
  Loader2
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/presentation/hooks/useAuth"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { teacher, loading, updateTeacher } = useAuth()

  const [editValues, setEditValues] = useState({
    firstname: teacher?.firstname || '',
    lastname: teacher?.lastname || '',
    email: teacher?.email || '',
    departement: teacher?.departement || ''
  })
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  // Show loading state while fetching teacher data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Chargement du profil...</span>
        </div>
      </div>
    )
  }

  // Show error state if no teacher data
  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p>Impossible de charger les données du profil.</p>
        </div>
      </div>
    )
  }

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getFullName = (firstname: string, lastname: string) => {
    return `${firstname} ${lastname}`
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(null)
    try {
      const response = await fetch('/api/teachers/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: teacher.id,
          ...editValues
        })
      })
      const data = await response.json()
      if (data.success && data.teacher) {
        updateTeacher(data.teacher); // update context in real time
        // Update localStorage with new token and teacher data
        if (data.token && data.teacher) {
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('teacher', JSON.stringify(data.teacher))
        }
        setEditSuccess('Profil mis à jour avec succès !')
        setIsEditing(false)
      } else {
        setEditError(data.message || 'Erreur lors de la mise à jour du profil.')
      }
    } catch (error) {
      setEditError('Erreur de connexion. Veuillez réessayer.')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Triangular decorative elements */}
        <div className="absolute top-1/4 left-20 w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-red-500/20 border-r-[30px] border-r-transparent transform rotate-45"></div>
        <div className="absolute top-1/3 right-32 w-0 h-0 border-l-[25px] border-l-transparent border-b-[40px] border-b-red-500/15 border-r-[25px] border-r-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-b-red-500/25 border-r-[20px] border-r-transparent transform rotate-90"></div>
        <div className="absolute top-2/3 right-1/3 w-0 h-0 border-l-[35px] border-l-transparent border-b-[60px] border-b-red-500/10 border-r-[35px] border-r-transparent transform -rotate-30"></div>
        <div className="absolute bottom-1/3 right-20 w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-red-500/30 border-r-[15px] border-r-transparent transform rotate-15"></div>
        
        <div className="w-full max-w-2xl">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 px-8 py-16 overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/3 rounded-full blur-xl"></div>
              <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-white/3 rounded-full blur-xl"></div>
              
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => {
                    setEditValues({
                      firstname: teacher.firstname,
                      lastname: teacher.lastname,
                      email: teacher.email,
                      departement: teacher.departement
                    });
                    setIsEditing(true);
                  }}
                  className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl px-4 py-2 text-white transition-all duration-300 border border-white/20"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Modifier</span>
                </button>
              </div>

              {/* Profile Photo */}
              <div className="flex flex-col items-center relative z-10">
                <div className="relative group mb-8">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-md scale-110"></div>
                  
                  {/* Main profile photo container */}
                  <div className="relative w-36 h-36 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30 backdrop-blur-sm">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={getFullName(teacher.firstname, teacher.lastname)}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-600">
                        {getInitials(teacher.firstname, teacher.lastname)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Name and Role */}
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">{getFullName(teacher.firstname, teacher.lastname)}</h1>
                  <div className="flex items-center justify-center space-x-6 text-red-50">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-lg font-medium">Professeur</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-lg font-medium">{teacher.departement}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Error Message */}
              {editError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{editError}</p>
                  <button 
                    onClick={() => setEditError(null)}
                    className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
                  >
                    Fermer
                  </button>
                </div>
              )}
              {editSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm">{editSuccess}</p>
                  <button 
                    onClick={() => setEditSuccess(null)}
                    className="mt-2 text-green-600 hover:text-green-800 text-xs underline"
                  >
                    Fermer
                  </button>
                </div>
              )}
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="firstname"
                        value={editValues.firstname}
                        onChange={handleEditChange}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="lastname"
                        value={editValues.lastname}
                        onChange={handleEditChange}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editValues.email}
                        onChange={handleEditChange}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                      <input
                        type="text"
                        name="departement"
                        value={editValues.departement}
                        onChange={handleEditChange}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold hover:bg-gray-300"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Bio Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-red-500" />
                      À propos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Professeur passionné par l'enseignement et dédié à l'excellence académique. 
                      Spécialisé dans le département {teacher.departement} avec une expertise dans 
                      l'encadrement et la formation des étudiants.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {teacher.departement}
                      </span>
                    </div>
                  </div>
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-red-500" />
                      Informations de Contact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-200 group-hover:border-red-200 transition-colors">
                          <Mail className="w-5 h-5 text-red-500" />
                          <span className="text-gray-900 font-medium">{teacher.email}</span>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-200 group-hover:border-red-200 transition-colors">
                          <GraduationCap className="w-5 h-5 text-red-500" />
                          <span className="text-gray-900 font-medium">{teacher.departement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 