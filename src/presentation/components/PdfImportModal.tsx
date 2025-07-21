"use client"

import { useState, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { PDFImportService, ExtractedSchedule, ScheduleDay, ScheduleEvent } from '@/infrastructure/services/PDFImportService'

interface PdfImportModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleImported?: (schedule: ExtractedSchedule) => void
  teacherId?: number
}

export function PdfImportModal({ isOpen, onClose, onScheduleImported, teacherId }: PdfImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedSchedule, setExtractedSchedule] = useState<ExtractedSchedule | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    success: boolean
    importedCount: number
    errors: string[]
    message: string
  } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfService = new PDFImportService()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    setSuccess(null)
    setExtractedSchedule(null)
    
    // Validate file
    const validation = pdfService.validatePDFFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }
    
    setSelectedFile(file)
    processFile(file)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const schedule = await pdfService.extractScheduleFromPDF(file)
      setExtractedSchedule(schedule)
      setSuccess(`Successfully extracted ${schedule.totalEvents} events from ${schedule.totalDays} days`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleImport = async () => {
    if (!extractedSchedule) return
    
    setIsImporting(true)
    setError(null)
    setImportResult(null)
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/schedule/import-schedules', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          extractedData: extractedSchedule
        }),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setImportResult(result)
        setSuccess(result.message)
        
        // Call the callback if provided
        if (onScheduleImported) {
          onScheduleImported(extractedSchedule)
        }
      } else {
        setError(result.error || 'Failed to import schedules')
        setImportResult(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import schedules')
    } finally {
      setIsImporting(false)
    }
  }

  const resetModal = () => {
    setSelectedFile(null)
    setExtractedSchedule(null)
    setError(null)
    setSuccess(null)
    setImportResult(null)
    setIsProcessing(false)
    setIsImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const getEventTypeIcon = (subject: string) => {
    const lowerSubject = subject.toLowerCase()
    if (lowerSubject.includes('math') || lowerSubject.includes('mathématiques')) return <BookOpen className="w-4 h-4" />
    if (lowerSubject.includes('info') || lowerSubject.includes('informatique')) return <Users className="w-4 h-4" />
    if (lowerSubject.includes('physique')) return <Clock className="w-4 h-4" />
    return <Calendar className="w-4 h-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Importer un Emploi du Temps PDF</h2>
              <p className="text-gray-600">Extrayez et visualisez les données d'emploi du temps depuis un fichier PDF</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File Upload Section */}
          {!extractedSchedule && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Glissez-déposez votre fichier PDF ici
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ou cliquez pour sélectionner un fichier
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Sélectionner un fichier PDF
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Formats acceptés: PDF</p>
                  <p>Taille maximale: 10MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Extraction des données en cours...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedSchedule && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Jours extraits</p>
                      <p className="text-2xl font-bold">{extractedSchedule.totalDays}</p>
                    </div>
                    <Calendar className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Événements</p>
                      <p className="text-2xl font-bold">{extractedSchedule.totalEvents}</p>
                    </div>
                    <BookOpen className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Fichier</p>
                      <p className="text-lg font-bold truncate">{selectedFile?.name}</p>
                    </div>
                    <FileText className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  Détails de l'emploi du temps
                </h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {extractedSchedule.schedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{day.day}</h4>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                          {day.date}
                        </span>
                      </div>
                      
                      {day.events.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Aucun événement programmé</p>
                      ) : (
                        <div className="space-y-2">
                          {day.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    {getEventTypeIcon(event.subject)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{event.subject}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {event.time}
                                      </span>
                                      <span className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        {event.class}
                                      </span>
                                      <span className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {event.room}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>


            </div>
          )}
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t border-gray-100 p-6 flex-shrink-0">
          {/* Import Result */}
          {importResult && (
            <div className={`border rounded-lg p-4 mb-4 ${
              importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-semibold ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.message}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <p>Événements importés: {importResult.importedCount}</p>
                {importResult.errors.length > 0 && (
                  <p>Erreurs: {importResult.errors.length}</p>
                )}
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Détails des erreurs:</p>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {importResult ? 'Fermer' : 'Annuler'}
            </button>
            {!importResult && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importation...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Confirmer et Importer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 