"use client"

import { SideNavLayout } from "@/presentation/components/SideNavLayout"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Edit3,
  Camera,
  Briefcase,
  GraduationCap
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock teacher data - in real app this would come from API/context
  const teacher = {
    name: "Dr. Sarah Benali",
    email: "s.benali@esprit.edu",
    phone: "+216 22 123 456",
    address: "Tunis, Tunisia",
    role: "Professeur Principal",
    department: "Informatique",
    specialization: "Intelligence Artificielle & Machine Learning",
    joinDate: "2016-09-01",
    avatar: null, // Will use initials or uploaded photo
    bio: "Passionnée par l'enseignement et la recherche en intelligence artificielle, je m'efforce d'inspirer mes étudiants à explorer les frontières de la technologie moderne."
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <SideNavLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center p-8">
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
                  onClick={() => setIsEditing(!isEditing)}
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
                    {teacher.avatar ? (
                      <Image
                        src={teacher.avatar}
                        alt={teacher.name}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-600">
                        {getInitials(teacher.name)}
                      </span>
                    )}
                  </div>
                  
                  {/* Camera Icon for Photo Upload */}
                  <button className="absolute bottom-1 right-1 w-12 h-12 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110 border-2 border-red-100">
                    <Camera className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                
                {/* Name and Role */}
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">{teacher.name}</h1>
                  <div className="flex items-center justify-center space-x-6 text-red-50">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-lg font-medium">{teacher.role}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-lg font-medium">{teacher.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Bio Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-red-500" />
                  À propos
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">{teacher.bio}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {teacher.specialization}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-200 group-hover:border-red-200 transition-colors">
                      <Phone className="w-5 h-5 text-red-500" />
                      <span className="text-gray-900 font-medium">{teacher.phone}</span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-200 group-hover:border-red-200 transition-colors">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <span className="text-gray-900 font-medium">{teacher.address}</span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'adhésion</label>
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-200 group-hover:border-red-200 transition-colors">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <span className="text-gray-900 font-medium">
                        {new Date(teacher.joinDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideNavLayout>
  )
} 