"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Users, Calendar, Clock, LogOut, Settings, Bell, ChevronDown, User, Shield, Briefcase, Loader2, BookOpen } from "lucide-react"
import { useState } from "react"

interface SideNavLayoutProps {
  children: React.ReactNode
}

export function SideNavLayout({ children }: SideNavLayoutProps) {
  const pathname = usePathname()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { isAuthenticated, teacher, loading, logout } = useAuth()

  const navigationItems = [
    {
      name: "Gestion Classroom",
      href: "/gestion-classroom",
      icon: Users,
      description: "Gérer les salles de classe",
      badge: "12"
    },
    {
      name: "Gestion Emplois",
      href: "/gestion-emplois", 
      icon: Calendar,
      description: "Gérer les emplois du temps",
      badge: null
    },
    {
      name: "Gestion Horaire",
      href: "/gestion-horraire",
      icon: Clock,
      description: "Gérer les horaires",
      badge: "3"
    }
  ]

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getFullName = (firstname: string, lastname: string) => {
    return `${firstname} ${lastname}`
  }

  const handleLogout = async () => {
    await logout()
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render the layout (will be redirected by pages)
  if (!isAuthenticated || !teacher) {
    return <div>{children}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* Enhanced Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white/98 backdrop-blur-2xl border-r border-gray-200/60 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Enhanced Header with Logo */}
          <div className="flex items-center justify-between h-18 px-6 py-4 border-b border-gray-100">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/logo.png"
                alt="Esprit Logo"
                width={140}
                height={45}
                className="h-8 w-auto transition-all duration-300 group-hover:scale-105"
              />
            </Link>
            
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* Teacher Profile Section */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 group border border-gray-200/50"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                    {teacher.photoUrl ? (
                      <Image
                        src={teacher.photoUrl}
                        alt={getFullName(teacher.firstname, teacher.lastname)}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      getInitials(teacher.firstname, teacher.lastname)
                    )}
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {getFullName(teacher.firstname, teacher.lastname)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <Briefcase className="w-3 h-3" />
                    <span>Enseignant</span>
                  </div>
                </div>

                {/* Dropdown icon */}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 backdrop-blur-xl z-10">
                  <div className="space-y-3">
                    <div className="pb-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{teacher.email}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                        <Shield className="w-3 h-3" />
                        <span>Département {teacher.departement}</span>
                      </div>
                    </div>
                    
                    <Link 
                      href="/profile"
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Mon Profil</span>
                    </Link>
                    
                    <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Paramètres</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-6 py-6">
            <div className="space-y-2">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tableau de Bord
                </h3>
              </div>
              
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center px-4 py-4 rounded-2xl font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-black via-gray-800 to-black text-white shadow-xl"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {/* Enhanced Active indicator */}
                    {isActive && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent rounded-2xl"></div>
                      </>
                    )}
                    
                    {/* Enhanced Icon */}
                    <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl mr-4 transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 shadow-lg"
                        : "bg-gray-100 group-hover:bg-red-50 group-hover:shadow-md"
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-red-500"
                      }`} />
                      
                      {/* Badge for notifications */}
                      {item.badge && (
                        <span className={`absolute -top-2 -right-2 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-red-500 text-white"
                            : "bg-red-500 text-white"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced Content */}
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {item.description}
                      </div>
                    </div>

                    {/* Enhanced Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Enhanced Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                © 2024 Esprit Education
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 group"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
} 