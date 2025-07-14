"use client"

import React, { useState } from 'react'
import { X, User, Mail, Hash, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (studentData: AddStudentFormData) => Promise<void>
  classeId: number
  className?: string
  isLoading?: boolean
}

export interface AddStudentFormData {
  firstname: string
  lastname: string
  email: string
  numeroEtudiant: string
  classeId: number
  dateNaissance?: string
}

export function AddStudentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classeId, 
  className,
  isLoading = false 
}: AddStudentModalProps) {
  const [formData, setFormData] = useState<AddStudentFormData>({
    firstname: '',
    lastname: '',
    email: '',
    numeroEtudiant: '',
    classeId: classeId,
    dateNaissance: ''
  })

  const [errors, setErrors] = useState<Partial<AddStudentFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof AddStudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AddStudentFormData> = {}

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Le prénom est requis'
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    if (!formData.numeroEtudiant.trim()) {
      newErrors.numeroEtudiant = 'Le numéro étudiant est requis'
    } else if (!/^\d{4}[\w\d]+$/.test(formData.numeroEtudiant)) {
      newErrors.numeroEtudiant = 'Format de numéro étudiant invalide (ex: 2024001234)'
    }

    if (formData.dateNaissance && new Date(formData.dateNaissance) > new Date()) {
      newErrors.dateNaissance = 'La date de naissance ne peut pas être dans le futur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        numeroEtudiant: '',
        classeId: classeId,
        dateNaissance: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        numeroEtudiant: '',
        classeId: classeId,
        dateNaissance: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-red-50 to-red-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvel Étudiant</h2>
              <p className="text-sm text-gray-600">
                Ajouter un étudiant à la classe {className || classeId}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4 text-red-500" />
                <span>Prénom *</span>
              </label>
              <input
                type="text"
                value={formData.firstname}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.firstname ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
                }`}
                placeholder="Entrez le prénom"
                disabled={isSubmitting}
              />
              {errors.firstname && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.firstname}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4 text-red-500" />
                <span>Nom *</span>
              </label>
              <input
                type="text"
                value={formData.lastname}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.lastname ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
                }`}
                placeholder="Entrez le nom"
                disabled={isSubmitting}
              />
              {errors.lastname && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.lastname}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-500" />
              <span>Email *</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="etudiant@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Student Number Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Hash className="w-4 h-4 text-red-500" />
              <span>Numéro Étudiant *</span>
            </label>
            <input
              type="text"
              value={formData.numeroEtudiant}
              onChange={(e) => handleInputChange('numeroEtudiant', e.target.value)}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.numeroEtudiant ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="2024001234"
              disabled={isSubmitting}
            />
            {errors.numeroEtudiant && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.numeroEtudiant}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Format: Année suivie de caractères (ex: 2024001234)
            </p>
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Date de Naissance</span>
            </label>
            <input
              type="date"
              value={formData.dateNaissance}
              onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.dateNaissance ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              disabled={isSubmitting}
            />
            {errors.dateNaissance && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.dateNaissance}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/60">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Créer l'Étudiant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 