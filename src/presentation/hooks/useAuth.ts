import { useState, useEffect } from 'react'

/**
 * Teacher interface for authentication state
 */
export interface AuthTeacher {
  id: number
  firstname: string
  lastname: string
  email: string
  departement: string
  photoUrl?: string
  role: string
}

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean
  teacher: AuthTeacher | null
  token: string | null
  loading: boolean
  error: string | null
}

/**
 * Custom Hook - Presentation layer
 * This hook manages authentication state and provides current teacher information
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    teacher: null,
    token: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true, error: null }))

        // First, try to get token from localStorage
        const token = localStorage.getItem('auth_token')
        const teacherData = localStorage.getItem('teacher')

        if (token && teacherData) {
          try {
            const teacher = JSON.parse(teacherData) as AuthTeacher
            
            // Validate token with server
            const response = await fetch('/api/auth/validate', {
              method: 'GET',
              credentials: 'include' // Include cookies
            })

            if (response.ok) {
              const data = await response.json()
              
              if (data.valid) {
                setAuthState({
                  isAuthenticated: true,
                  teacher,
                  token,
                  loading: false,
                  error: null
                })
                return
              }
            }
          } catch (parseError) {
            console.error('Error parsing teacher data:', parseError)
          }
        }

        // If no valid token/data, try cookie-based validation
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.valid && data.teacher) {
            const teacher: AuthTeacher = {
              id: data.teacher.id,
              firstname: data.teacher.firstname || '',
              lastname: data.teacher.lastname || '',
              email: data.teacher.email,
              departement: data.teacher.departement || '',
              photoUrl: data.teacher.photoUrl,
              role: data.teacher.role || ''
            }

            setAuthState({
              isAuthenticated: true,
              teacher,
              token: null, // Token is in cookie
              loading: false,
              error: null
            })
            return
          }
        }

        // No valid authentication found
        setAuthState({
          isAuthenticated: false,
          teacher: null,
          token: null,
          loading: false,
          error: null
        })

        // Clean up localStorage if authentication failed
        localStorage.removeItem('auth_token')
        localStorage.removeItem('teacher')

      } catch (error) {
        console.error('Authentication check failed:', error)
        setAuthState({
          isAuthenticated: false,
          teacher: null,
          token: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        })

        // Clean up localStorage on error
        localStorage.removeItem('auth_token')
        localStorage.removeItem('teacher')
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('auth_token')
      localStorage.removeItem('teacher')
      
      setAuthState({
        isAuthenticated: false,
        teacher: null,
        token: null,
        loading: false,
        error: null
      })

      // Redirect to login
      window.location.href = '/login'
    }
  }

  const refreshAuth = () => {
    setAuthState(prev => ({ ...prev, loading: true }))
    // This will trigger the useEffect to re-run
    window.location.reload()
  }

  // Function to update teacher photo in local state
  const updateTeacherPhoto = (photoUrl: string) => {
    setAuthState(prev => ({
      ...prev,
      teacher: prev.teacher ? {
        ...prev.teacher,
        photoUrl
      } : null
    }))

    // Also update localStorage if present
    const teacherData = localStorage.getItem('teacher')
    if (teacherData) {
      try {
        const teacher = JSON.parse(teacherData)
        teacher.photoUrl = photoUrl
        localStorage.setItem('teacher', JSON.stringify(teacher))
      } catch (error) {
        console.error('Error updating teacher photo in localStorage:', error)
      }
    }
  }

  const updateTeacher = (updated: AuthTeacher) => {
    setAuthState(prev => ({
      ...prev,
      teacher: updated
    }))
    localStorage.setItem('teacher', JSON.stringify(updated))
  }

  // Role checking helper functions
  const isAdmin = () => {
    return authState.teacher?.role === 'admin'
  }

  const isTeacher = () => {
    return authState.teacher?.role === 'teacher'
  }

  const hasRole = (role: string) => {
    return authState.teacher?.role === role
  }

  const canAccessAdminFeatures = () => {
    return isAdmin() || authState.teacher?.departement.toLowerCase().includes('admin') || 
           authState.teacher?.departement.toLowerCase().includes('direction')
  }

  return {
    ...authState,
    logout,
    refreshAuth,
    updateTeacherPhoto,
    updateTeacher,
    isAdmin,
    isTeacher,
    hasRole,
    canAccessAdminFeatures
  }
} 