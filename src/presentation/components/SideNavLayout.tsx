"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Users, Calendar, Clock, LogOut, Settings, Bell, ChevronDown, User, Shield, Briefcase, Loader2, BookOpen, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface SideNavLayoutProps {
  children: React.ReactNode
}

export function SideNavLayout({ children }: SideNavLayoutProps) {
  const pathname = usePathname()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false)
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const closeDesktopSidebar = () => {
    setIsDesktopSidebarOpen(false)
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
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                <Link href="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
                  <Image
                    src="/logo.png"
                    alt="Esprit Logo"
                    width={120}
                    height={38}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-6 py-6">
                {/* Mobile Teacher Profile Section */}
                <div className="mb-6">
                  <Link 
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50 hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 group"
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
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {getFullName(teacher.firstname, teacher.lastname)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Briefcase className="w-3 h-3" />
                        <span>Enseignant</span>
                      </div>
                    </div>
                  </Link>
                </div>

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
                        onClick={closeMobileMenu}
                        className={`group relative flex items-center px-4 py-4 rounded-2xl font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-black via-gray-800 to-black text-white shadow-xl"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {isActive && (
                          <>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r-full"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent rounded-2xl"></div>
                          </>
                        )}
                        
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

                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Mobile Footer */}
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
        </>
      )}

      {/* Desktop Menu Overlay - Same as Mobile */}
      {isDesktopSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="hidden lg:block fixed inset-0 bg-black/50 z-40"
            onClick={closeDesktopSidebar}
          />
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Desktop Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                <Link href="/" className="flex items-center space-x-3" onClick={closeDesktopSidebar}>
                  <Image
                    src="/logo.png"
                    alt="Esprit Logo"
                    width={120}
                    height={38}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={closeDesktopSidebar}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="flex-1 px-6 py-6">
                {/* Desktop Teacher Profile Section */}
                <div className="mb-6">
                  <Link 
                    href="/profile"
                    onClick={closeDesktopSidebar}
                    className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50 hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 group"
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
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {getFullName(teacher.firstname, teacher.lastname)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Briefcase className="w-3 h-3" />
                        <span>Enseignant</span>
                      </div>
                    </div>
                  </Link>
                </div>

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
                        onClick={closeDesktopSidebar}
                        className={`group relative flex items-center px-4 py-4 rounded-2xl font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-black via-gray-800 to-black text-white shadow-xl"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {isActive && (
                          <>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r-full"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent rounded-2xl"></div>
                          </>
                        )}
                        
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

                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Desktop Footer */}
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
        </>
      )}

      {/* Desktop Hamburger Button - Same as Mobile */}
      {!isDesktopSidebarOpen && (
        <div className="hidden lg:block fixed top-0 left-0 z-50">
          <button
            onClick={() => setIsDesktopSidebarOpen(true)}
            className="w-8 h-8 bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
          >
            <Menu className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Mobile Hamburger Button */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed top-0 left-0 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-8 h-8 bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
          >
            <Menu className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen pt-20 lg:pt-0">
        {children}
      </div>
    </div>
  )
} 