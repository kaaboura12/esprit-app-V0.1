"use client"

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'

export interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleAdded: () => void
  selectedDate?: Date
}

interface Subject {
  id: number
  nommatiere: string
}

interface Class {
  id: number
  nom_classe: string
  bloc: string
  numclasse: string
}

export function AddScheduleModal({ 
  isOpen, 
  onClose, 
  onScheduleAdded,
  selectedDate 
}: AddScheduleModalProps) {
  const { teacher } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    matiereId: '',
    classeId: '',
    scheduleDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    sessionType: 'cours' as 'cours' | 'td' | 'tp' | 'exam',
    notes: ''
  })

  // Load dropdown data
  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  // Update day of week when date changes
  useEffect(() => {
    if (formData.scheduleDate) {
      const date = new Date(formData.scheduleDate)
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      const dayOfWeek = dayNames[date.getDay()]
      setFormData(prev => ({ ...prev, dayOfWeek }))
    }
  }, [formData.scheduleDate])

  const loadDropdownData = async () => {
    try {
      // Load subjects and classes
      const [subjectsRes, classesRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/classes')
      ])

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData)
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(classesData)
      }
    } catch (err) {
      console.error('Error loading dropdown data:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Calculate week start date (Monday)
      const scheduleDate = new Date(formData.scheduleDate)
      const weekStartDate = new Date(scheduleDate)
      weekStartDate.setDate(scheduleDate.getDate() - scheduleDate.getDay() + 1)

      const scheduleData = {
        teacherId: teacher?.id || 0,
        matiereId: parseInt(formData.matiereId),
        classeId: parseInt(formData.classeId),
        dayOfWeek: formData.dayOfWeek,
        scheduleDate: formData.scheduleDate,
        weekStartDate: weekStartDate.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        sessionType: formData.sessionType,
        notes: formData.notes
      }

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create schedule')
      }

      setSuccess(true)
      setTimeout(() => {
        onScheduleAdded()
        onClose()
        resetForm()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      matiereId: '',
      classeId: '',
      scheduleDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      sessionType: 'cours',
      notes: ''
    })
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetForm()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvel Événement</h2>
              <p className="text-gray-600">Ajouter un nouveau cours à l'emploi du temps</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-800 font-medium">Événement créé avec succès!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.scheduleDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de début
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>

          {/* Teacher and Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Enseignant
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                {teacher ? `${teacher.firstname} ${teacher.lastname} - ${teacher.departement}` : 'Enseignant non connecté'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Matière
              </label>
              <select
                value={formData.matiereId}
                onChange={(e) => setFormData(prev => ({ ...prev, matiereId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.nommatiere}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class and Session Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Classe/Salle
              </label>
              <select
                value={formData.classeId}
                onChange={(e) => setFormData(prev => ({ ...prev, classeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom_classe} ({classe.bloc}{classe.numclasse})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de session
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="cours">Cours</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="exam">Examen</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ajouter des notes ou commentaires..."
            />
          </div>

          {/* Day of Week Display */}
          {formData.dayOfWeek && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                Jour de la semaine: <span className="font-medium capitalize">{formData.dayOfWeek}</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Créé!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Créer l'événement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 