"use client"

import { useState, useEffect } from 'react'

import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Clock, 
  Calendar, 
  Users, 
  Search,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Briefcase,
  BarChart3,
  Target
} from 'lucide-react'
import { HourlyRate, HourlyShiftType, RateType } from '@/core/entities/HourlyRate'
import { CreateHourlyRateDTO, UpdateHourlyRateDTO } from '@/application/dtos/HourlyRateDTO'

const SHIFT_TYPES: { value: HourlyShiftType; label: string }[] = [
  { value: 'cours_de_jour', label: 'Cours de Jour' },
  { value: 'alternance', label: 'Alternance' },
  { value: 'cours_de_soir', label: 'Cours de Soir' }
]

const RATE_TYPES: { value: RateType; label: string }[] = [
  { value: 'regular', label: 'Régulier' },
  { value: 'heures_supp', label: 'Heures Supplémentaires' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'soir', label: 'Soir' }
]

export default function GestionPrixHeurePage() {
  const [hourlyRates, setHourlyRates] = useState<HourlyRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState<number>(0)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Form states
  const [formData, setFormData] = useState<CreateHourlyRateDTO>({
    shiftType: 'cours_de_jour',
    rateType: 'regular',
    rateAmount: 0,
    academicYear: '',
    isActive: true
  })

  useEffect(() => {
    fetchHourlyRates()
    fetchCurrentAcademicYear()
  }, [])

  const fetchCurrentAcademicYear = async () => {
    try {
      const response = await fetch('/api/academic-year/current')
      if (response.ok) {
        const data = await response.json()
        setCurrentAcademicYear(data.year || getCurrentYearString())
        setFormData(prev => ({ ...prev, academicYear: data.year || getCurrentYearString() }))
      } else {
        // Fallback to current year if API fails
        const fallbackYear = getCurrentYearString()
        setCurrentAcademicYear(fallbackYear)
        setFormData(prev => ({ ...prev, academicYear: fallbackYear }))
      }
    } catch (error) {
      console.error('Error fetching current academic year:', error)
      // Fallback to current year if any error occurs
      const fallbackYear = getCurrentYearString()
      setCurrentAcademicYear(fallbackYear)
      setFormData(prev => ({ ...prev, academicYear: fallbackYear }))
    }
  }

  const getCurrentYearString = () => {
    const currentYear = new Date().getFullYear()
    return `${currentYear}-${currentYear + 1}`
  }

  const fetchHourlyRates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hourly-rates')
      if (response.ok) {
        const data = await response.json()
        setHourlyRates(data)
      } else {
        setError('Erreur lors du chargement des tarifs')
      }
    } catch (error) {
      setError('Erreur lors du chargement des tarifs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/hourly-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchHourlyRates()
        setShowCreateModal(false)
        setSuccessMessage('Tarif créé avec succès')
        setError(null)
        setFormData({
          shiftType: 'cours_de_jour',
          rateType: 'regular',
          rateAmount: 0,
          academicYear: currentAcademicYear,
          isActive: true
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création')
        setSuccessMessage(null)
      }
    } catch (error) {
      setError('Erreur lors de la création')
    }
  }

  const handleUpdate = async (id: number, rateAmount: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/hourly-rates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rateAmount, isActive }),
      })

      if (response.ok) {
        await fetchHourlyRates()
        setEditingId(null)
        setSuccessMessage('Tarif mis à jour avec succès')
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la mise à jour')
        setSuccessMessage(null)
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      return
    }

    try {
      const response = await fetch(`/api/hourly-rates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHourlyRates()
        setSuccessMessage('Tarif supprimé avec succès')
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la suppression')
        setSuccessMessage(null)
      }
    } catch (error) {
      setError('Erreur lors de la suppression')
    }
  }

  const getShiftTypeLabel = (shiftType: HourlyShiftType) => {
    return SHIFT_TYPES.find(s => s.value === shiftType)?.label || shiftType
  }

  const getRateTypeLabel = (rateType: RateType) => {
    return RATE_TYPES.find(r => r.value === rateType)?.label || rateType
  }

  // Filter hourly rates based on search
  const filteredHourlyRates = hourlyRates.filter(rate => {
    const matchesSearch = 
      getShiftTypeLabel(rate.shiftType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRateTypeLabel(rate.rateType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rateAmount.toString().includes(searchTerm)
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Chargement des tarifs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="px-4 sm:px-6 md:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Gestion des Prix/Heure
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">
                    Gérez les tarifs horaires pour différents types de postes et d'heures
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{hourlyRates.length}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Tarifs</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+2</span>
                <span className="text-gray-500 ml-1">ce mois</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {hourlyRates.filter(rate => rate.isActive).length}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Tarifs Actifs</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">En cours</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {new Set(hourlyRates.map(rate => rate.shiftType)).size}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Types de Postes</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">Disponibles</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{currentAcademicYear}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Année Académique</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">En cours</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex items-center w-full">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un tarif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full"
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-500 hover:text-green-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Liste des Tarifs
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">{filteredHourlyRates.length} tarif(s)</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredHourlyRates.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tarif trouvé</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Aucun tarif ne correspond à votre recherche.' : 'Commencez par ajouter votre premier tarif.'}
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type de Poste
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type de Tarif
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant (DT)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Année Académique
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHourlyRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getShiftTypeLabel(rate.shiftType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getRateTypeLabel(rate.rateType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingId === rate.id ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingValue}
                                onChange={(e) => setEditingValue(parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdate(rate.id, editingValue, rate.isActive)
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingId(null)
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className="font-semibold text-green-600">
                                {rate.rateAmount.toFixed(2)} DT
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rate.academicYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rate.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {rate.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {editingId === rate.id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(rate.id, editingValue, rate.isActive)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingId(rate.id)
                                    setEditingValue(rate.rateAmount)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


      </div>
    </div>
  )
}
