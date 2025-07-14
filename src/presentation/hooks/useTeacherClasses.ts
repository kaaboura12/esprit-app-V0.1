import { useState, useEffect } from 'react'
import { TeacherClassAssignmentDTO, GetTeacherClassesResponseDTO } from '@/application/dtos/TeacherClassDTO'

/**
 * Custom Hook - Presentation layer
 * This hook manages teacher class assignments state and API calls
 */
export function useTeacherClasses() {
  const [classes, setClasses] = useState<TeacherClassAssignmentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeacherClasses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/teachers/classes', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: GetTeacherClassesResponseDTO = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch teacher classes')
      }

      setClasses(data.classes || [])
    } catch (err) {
      console.error('Error fetching teacher classes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeacherClasses()
  }, [])

  const refreshClasses = () => {
    fetchTeacherClasses()
  }

  // Filter classes by search term
  const filterClasses = (searchTerm: string, selectedBlock: string = 'all') => {
    return classes.filter(classItem => {
      const matchesSearch = 
        classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesBlock = selectedBlock === 'all' || classItem.bloc === selectedBlock
      
      return matchesSearch && matchesBlock
    })
  }

  // Get unique blocks from classes
  const getAvailableBlocks = () => {
    const blocks = [...new Set(classes.map(c => c.bloc))].sort()
    return ['all', ...blocks]
  }

  // Get statistics
  const getStatistics = () => {
    const totalClasses = classes.length
    const totalStudents = classes.reduce((sum, c) => sum + c.currentStudents, 0)
    const averageCapacity = classes.length > 0 
      ? Math.round(classes.reduce((sum, c) => sum + c.capacityPercentage, 0) / classes.length)
      : 0
    
    const statusCounts = classes.reduce((counts, c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return {
      totalClasses,
      totalStudents,
      averageCapacity,
      statusCounts,
      nearlyFullClasses: classes.filter(c => c.isNearlyFull).length
    }
  }

  return {
    classes,
    loading,
    error,
    refreshClasses,
    filterClasses,
    getAvailableBlocks,
    getStatistics
  }
} 