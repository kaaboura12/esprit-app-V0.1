"use client"

import { useSchedule } from "@/presentation/hooks/useSchedule"
import { useAuth } from "@/presentation/hooks/useAuth"
import { AddScheduleModal } from "@/presentation/components/AddScheduleModal"
import { PdfImportModal } from "@/presentation/components/PdfImportModal"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useState, useRef, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Download, 
  Upload, 
  Settings,
  Users,
  Clock,
  BookOpen,
  MapPin,
  Edit3,
  Trash2,
  X,
  Loader2,
  FileText
} from 'lucide-react'
import { ExtractedSchedule } from "@/infrastructure/services/PDFImportService"

interface ScheduleEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    teacher: string
    classroom: string
    students: number
    department: string
    type: 'cours' | 'exam' | 'td' | 'tp'
    description?: string
    classeNom?: string
  }
}

export default function GestionEmploisPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState('timeGridWeek')
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isPdfImportModalOpen, setIsPdfImportModalOpen] = useState(false)

  // Use the schedule hook to get dynamic data
  const { schedules, loading, error, stats, getCalendarEvents, getScheduleById, loadSchedulesByWeek, loadStats, loadAllSchedules } = useSchedule()
  
  // Use the auth hook to get the logged-in teacher
  const { teacher } = useAuth()
  
  // Convert schedules to calendar events
  const events = getCalendarEvents()

  // Add PAUSE background event for each day of the week
  const pauseEvents = Array.from({ length: 7 }).map((_, i) => ({
    id: `pause-${i}`,
    title: 'PAUSE',
    startTime: '12:15:00',
    endTime: '13:30:00',
    daysOfWeek: [i], // 0=Sunday, 1=Monday, ...
    display: 'background',
    backgroundColor: '#e5e7eb',
    textColor: '#6b7280',
    rendering: 'background',
    className: 'pause-block',
    editable: false,
    overlap: false,
    allDay: false
  }))

  const allEvents = [...events, ...pauseEvents]

  // Debug: Log all events
  console.log('All calendar events:', allEvents)

  // Load all schedules on mount
  useEffect(() => {
    if (teacher) {
      loadAllSchedules()
      loadStats()
    }
  }, [teacher])

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(new Date(selectInfo.start))
    setIsAddEventModalOpen(true)
  }

  const handleEventClick = async (clickInfo: any) => {
    const eventId = parseInt(clickInfo.event.id)
    const schedule = await getScheduleById(eventId)
    if (schedule) {
      // Convert schedule to event format for the modal
      const event: ScheduleEvent = {
        id: schedule.id.toString(),
        title: schedule.matiereNom || `Matière ${schedule.matiereId}`,
        start: `${schedule.scheduleDate.split('T')[0]}T${schedule.startTime}:00`,
        end: `${schedule.scheduleDate.split('T')[0]}T${schedule.endTime}:00`,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          teacher: schedule.teacherName || `Enseignant ${schedule.teacherId}`,
          classroom: schedule.classroom || 'Salle non définie',
          students: 0,
          department: 'Département',
          type: schedule.sessionType,
          description: schedule.notes,
          classeNom: schedule.classeNom || `Classe ${schedule.classeId}`
        }
      }
      setSelectedEvent(event)
      setIsEventDetailsModalOpen(true)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'cours': return <BookOpen className="w-4 h-4" />
      case 'exam': return <Users className="w-4 h-4" />
      case 'td': return <Settings className="w-4 h-4" />
      case 'tp': return <Clock className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'cours': return 'Cours'
      case 'exam': return 'Examen'
      case 'td': return 'TD'
      case 'tp': return 'TP'
      default: return 'Événement'
    }
  }

  const updateCalendarTitle = () => {
    const titleElement = document.getElementById('calendar-title')
    if (titleElement && calendarRef.current) {
      const api = calendarRef.current.getApi()
      const view = api.view
      const title = view.title
      titleElement.textContent = title
    }
  }

  const handlePdfScheduleImported = (schedule: ExtractedSchedule) => {
    // Refresh the calendar data after import
    const currentWeek = new Date()
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1)
    loadSchedulesByWeek(startOfWeek)
    loadStats()
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white/95 backdrop-blur-xl border-b border-[#e5e7eb] sticky top-0 z-40">
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestion des Emplois du Temps</h1>
                    <p className="text-[#6b7280] mt-1 text-sm sm:text-base">Organisez et gérez les emplois du temps de votre établissement</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedDate(new Date())
                    setIsAddEventModalOpen(true)
                  }}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#ef4444] text-white rounded-xl font-semibold hover:bg-[#dc2626] transition-colors shadow-md mt-2 md:mt-0 w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Nouvel Événement
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-xl hover:shadow-md transition-all duration-300 w-full sm:w-auto justify-center">
                  <Download className="w-4 h-4 text-[#6b7280]" />
                  <span className="font-medium text-[#374151]">Exporter</span>
                </button>
                <button 
                  onClick={() => setIsPdfImportModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-xl hover:shadow-md transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <FileText className="w-4 h-4 text-[#6b7280]" />
                  <span className="font-medium text-[#374151]">Importer PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistic Cards */}
          <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.courseCount || 0)}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Cours cette semaine</span>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.tdCount || 0)}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">TD cette semaine</span>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.tpCount || 0)}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">TP cette semaine</span>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.activeSchedules || 0)}
                </span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Emplois actifs</span>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
              {/* Calendar Header with View Controls */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Calendrier</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Gérez vos emplois du temps</p>
                    </div>
                  </div>
                  {/* View Controls */}
                  <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                    <button
                      onClick={() => {
                        setCurrentView('dayGridMonth')
                        calendarRef.current?.getApi().changeView('dayGridMonth')
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        currentView === 'dayGridMonth'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Mois
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('timeGridWeek')
                        calendarRef.current?.getApi().changeView('timeGridWeek')
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        currentView === 'timeGridWeek'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Semaine
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('timeGridDay')
                        calendarRef.current?.getApi().changeView('timeGridDay')
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        currentView === 'timeGridDay'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Jour
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('listWeek')
                        calendarRef.current?.getApi().changeView('listWeek')
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        currentView === 'listWeek'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Liste
                    </button>
                  </div>
                </div>
                {/* Navigation Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => calendarRef.current?.getApi().prev()}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => calendarRef.current?.getApi().today()}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium text-xs sm:text-sm hover:shadow-md transition-all duration-200"
                    >
                      Aujourd'hui
                    </button>
                    <button
                      onClick={() => calendarRef.current?.getApi().next()}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mt-2 sm:mt-0" id="calendar-title">
                    {/* This will be updated by FullCalendar */}
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <span className="ml-2 text-gray-600">Chargement des emplois du temps...</span>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <X className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">Erreur: {error}</span>
                    </div>
                  </div>
                )}
                
                {!loading && !error && (
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={currentView}
                    headerToolbar={false}
                    events={allEvents}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    height="auto"
                    locale="fr"
                    timeZone="local"
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    eventDisplay="block"
                    dayHeaderFormat={{ weekday: 'long', day: 'numeric' }}
                    slotLabelFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }}
                    buttonText={{
                      today: "Aujourd'hui",
                      month: 'Mois',
                      week: 'Semaine',
                      day: 'Jour',
                      list: 'Liste'
                    }}
                    firstDay={1} // Start week on Monday
                    viewDidMount={() => {
                      // Custom styling for calendar
                      const calendarElement = document.querySelector('.fc')
                      if (calendarElement) {
                        calendarElement.classList.add('custom-calendar')
                      }
                      updateCalendarTitle()
                    }}
                    datesSet={updateCalendarTitle}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {isEventDetailsModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="relative p-6 border-b border-gray-100">
              <button
                onClick={() => setIsEventDetailsModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedEvent.backgroundColor }}
                >
                  {getEventTypeIcon(selectedEvent.extendedProps?.type || 'course')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getEventTypeIcon(selectedEvent.extendedProps?.type || 'course')}
                    <span>{getEventTypeLabel(selectedEvent.extendedProps?.type || 'course')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{selectedEvent.extendedProps?.teacher}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{selectedEvent.extendedProps?.classeNom}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salle</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{selectedEvent.extendedProps?.classroom}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de Session</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    {getEventTypeIcon(selectedEvent.extendedProps?.type || 'cours')}
                    <span>{getEventTypeLabel(selectedEvent.extendedProps?.type || 'cours')}</span>
                  </div>
                </div>
              </div>

              {selectedEvent.extendedProps?.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                    {selectedEvent.extendedProps.description}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300">
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddEventModalOpen}
        onClose={() => {
          setIsAddEventModalOpen(false)
          setSelectedDate(undefined)
        }}
        onScheduleAdded={() => {
          // Refresh the calendar data
          const currentWeek = new Date()
          const startOfWeek = new Date(currentWeek)
          startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1)
          loadSchedulesByWeek(startOfWeek)
          loadStats()
        }}
        selectedDate={selectedDate}
      />

      {/* PDF Import Modal */}
      <PdfImportModal
        isOpen={isPdfImportModalOpen}
        onClose={() => setIsPdfImportModalOpen(false)}
        onScheduleImported={handlePdfScheduleImported}
        teacherId={teacher?.id}
      />

      <style jsx global>{`
        .custom-calendar .fc-theme-standard td,
        .custom-calendar .fc-theme-standard th {
          border: 1px solid #e5e7eb;
        }
        
        .custom-calendar .fc-theme-standard .fc-scrollgrid {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .custom-calendar .fc-col-header-cell {
          background: linear-gradient(to right, #f9fafb, #f3f4f6);
          font-weight: 600;
          color: #374151;
          padding: 16px 8px;
        }
        
        .custom-calendar .fc-daygrid-day-number {
          color: #374151;
          font-weight: 600;
          padding: 8px;
        }
        
        .custom-calendar .fc-event {
          border: none !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-weight: 500 !important;
          font-size: 13px !important;
          margin: 2px 0 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .custom-calendar .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .custom-calendar .fc-button {
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        
        .custom-calendar .fc-button:hover {
          background: linear-gradient(to right, #dc2626, #b91c1c) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
        }
        
        .custom-calendar .fc-button:disabled {
          background: #d1d5db !important;
          color: #9ca3af !important;
        }
        
        .custom-calendar .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
        }
        
        .custom-calendar .fc-timegrid-slot-label {
          font-weight: 500 !important;
          color: #6b7280 !important;
        }
        
        .custom-calendar .fc-list-event:hover {
          background: #f9fafb !important;
        }
        
        .custom-calendar .fc-list-day-text {
          font-weight: 600 !important;
          color: #ef4444 !important;
        }
        
        .custom-calendar .fc-today {
          background: rgba(239, 68, 68, 0.05) !important;
        }
        
        .custom-calendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 50% !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .custom-calendar .pause-block {
          background: #e5e7eb !important;
          color: #6b7280 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          opacity: 0.7;
          pointer-events: none;
        }
      `}</style>
    </>
  )
} 