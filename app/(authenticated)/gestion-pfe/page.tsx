'use client';

import React, { useState, useEffect } from 'react';
import { useSoutenance } from '@/presentation/hooks/useSoutenance';
import { AddSoutenanceModal } from '@/presentation/components/AddSoutenanceModal';
import { AddNoteModal } from '@/presentation/components/AddNoteModal';
import { SoutenanceEntity, SoutenancePartEntity, SoutenanceNoteEntity } from '@/core/entities';
import { UpdateSoutenanceNoteRequest } from '@/application/use-cases/index';
import { Loader2, Users, AlertCircle } from 'lucide-react';

interface SoutenanceWithDetails {
    soutenance: SoutenanceEntity;
    parts: SoutenancePartEntity[];
    notes: SoutenanceNoteEntity[];
}

interface Student {
    id: number;
    prenom: string;
    nom: string;
    numeroEtudiant: string;
}

interface Teacher {
    id: number;
    nom: string;
    prenom: string;
}

export default function GestionPFEPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [currentTeacherId, setCurrentTeacherId] = useState<number>(0);
    const [editingNote, setEditingNote] = useState<{
        soutenance_part_id: number;
        teacher_id: number;
        note_text: string;
        partDescription?: string;
    } | null>(null);
    
    // Search state only
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<{[key: number]: number}>({});
    
    // Success message state
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        soutenances,
        loading,
        error,
        createSoutenance,
        createNote,
        updateNote,
        deleteNote,
        refreshSoutenances
    } = useSoutenance();

    // Fetch initial data for modal
    useEffect(() => {
        setStudents([]);
        setTeachers([]);
        
        // Get current user info from auth context
        const getCurrentUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentTeacherId(userData.id);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        
        getCurrentUser();
    }, []);

    // Fetch student and teacher names when soutenances change
    useEffect(() => {
        const fetchNames = async () => {
            if (soutenances.length === 0) return;

            try {
                // Extract unique student and teacher IDs from soutenances
                const studentIds = [...new Set(soutenances.map(s => s.soutenance.etudiant_id))];
                const teacherIds = [...new Set(soutenances.map(s => s.soutenance.teacher_id))];

                // Fetch only the students and teachers we need
                const [studentsResponse, teachersResponse] = await Promise.all([
                    fetch('/api/students/by-ids', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentIds })
                    }),
                    fetch('/api/teachers/by-ids', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teacherIds })
                    })
                ]);

                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    setStudents(studentsData);
                }

                if (teachersResponse.ok) {
                    const teachersData = await teachersResponse.json();
                    setTeachers(teachersData);
                }
            } catch (error) {
                console.error('Error fetching names:', error);
            }
        };

        fetchNames();
    }, [soutenances]);

    const handleCreateSoutenance = async (request: any) => {
        try {
            await createSoutenance(request);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating soutenance:', error);
        }
    };

    const handleUpdateNote = async (request: UpdateSoutenanceNoteRequest) => {
        try {
            // Remove teacher_id from request since it's now handled by the API
            const { soutenance_part_id, note_text } = request;
            await updateNote({ soutenance_part_id, teacher_id: 0, note_text });
            setEditingNote(null);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleDeleteNote = async (soutenance_part_id: number) => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteNote(soutenance_part_id, 0); // teacher_id is handled by API
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const getStudentName = (etudiant_id: number) => {
        if (!Array.isArray(students)) return 'Unknown Student';
        const student = students.find(s => s.id === etudiant_id);
        return student ? `${student.prenom} ${student.nom}` : 'Unknown Student';
    };

    const getTeacherName = (teacher_id: number) => {
        if (!Array.isArray(teachers)) return 'Unknown Teacher';
        const teacher = teachers.find(t => t.id === teacher_id);
        return teacher ? `${teacher.prenom} ${teacher.nom}` : 'Unknown Teacher';
    };

    // Filter soutenances based on search
    const filteredSoutenances = soutenances.filter(item => {
        const studentName = getStudentName(item.soutenance.etudiant_id).toLowerCase();
        return searchTerm === '' || studentName.includes(searchTerm.toLowerCase());
    });

    const togglePartExpansion = (partId: number) => {
        const newExpanded = new Set(expandedParts);
        if (newExpanded.has(partId)) {
            newExpanded.delete(partId);
        } else {
            newExpanded.add(partId);
        }
        setExpandedParts(newExpanded);
    };

    const hasTeacherNote = (partId: number, notes: SoutenanceNoteEntity[]) => {
        return notes.some(note => note.soutenance_part_id === partId && note.teacher_id === currentTeacherId);
    };

    const getTeacherNote = (partId: number, notes: SoutenanceNoteEntity[]) => {
        return notes.find(note => note.soutenance_part_id === partId && note.teacher_id === currentTeacherId);
    };

    const setActiveTabForSoutenance = (soutenanceId: number, tabIndex: number) => {
        setActiveTab(prev => ({ ...prev, [soutenanceId]: tabIndex }));
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-3 text-gray-600">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <span className="text-lg">Chargement des soutenances...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion PFE</h1>
                                <p className="text-gray-600 mt-1 text-sm sm:text-base">Gérez les soutenances et évaluations PFE</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg w-full sm:w-auto justify-center"
                            >
                                <span className="text-lg font-bold mr-2">+</span>
                                Nouvelle Soutenance
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Success Message */}
                {successMessage && (
                    <div className="px-4 sm:px-6 md:px-8 pb-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                <span className="text-red-800 text-sm font-medium">{successMessage}</span>
                            </div>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 md:px-8 py-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-red-600 font-bold text-xl sm:text-2xl">{filteredSoutenances.length}</span>
                        </div>
                        <span className="text-gray-700 text-xs sm:text-sm">Total Soutenances</span>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-red-600 font-bold text-xl sm:text-2xl">{filteredSoutenances.length}</span>
                        </div>
                        <span className="text-gray-700 text-xs sm:text-sm">Étudiants PFE</span>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-red-600 font-bold text-xl sm:text-2xl">
                                {filteredSoutenances.length > 0 
                                    ? Math.round((filteredSoutenances.filter(item => item.notes.length > 0).length / filteredSoutenances.length) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <span className="text-gray-700 text-xs sm:text-sm">Soutenances Évaluées</span>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-red-600 font-bold text-xl sm:text-2xl">{filteredSoutenances.filter(item => item.notes.length > 0).length}</span>
                        </div>
                        <span className="text-gray-700 text-xs sm:text-sm">Avec Notes</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
                    <div className="flex items-center w-full">
                        <span className="absolute left-3 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher par étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full"
                        />
                    </div>
                </div>
                
                {filteredSoutenances.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-medium text-gray-600 mb-2">Aucune soutenance trouvée</h3>
                        <p className="text-gray-500">Créez votre première soutenance pour commencer !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSoutenances.map((item: SoutenanceWithDetails) => (
                            <div key={item.soutenance.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-200">
                                {/* Card Header */}
                                <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-red-50 via-white to-red-50">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                                                {item.soutenance.sujet || 'Sujet non spécifié'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">{getStudentName(item.soutenance.etudiant_id)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>{formatDate(item.soutenance.date_soutenance)}</span>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2">
                                                {item.notes.length > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {item.notes.length} note{item.notes.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                                {hasTeacherNote(item.parts[0]?.id ?? 0, item.notes) && (
                                                    <div className="bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium border border-red-200">
                                                        ✓ Évalué
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content - Parts with Horizontal Tabs */}
                                <div className="p-6">
                                    {item.parts.length > 0 && (
                                        <div className="space-y-5">
                                            {/* Horizontal Tabs for Parts */}
                                            <div className="flex space-x-1 border-b border-gray-100">
                                                {item.parts.map((part, partIndex) => (
                                                    <button
                                                        key={part.id ?? partIndex}
                                                        onClick={() => setActiveTabForSoutenance(item.soutenance.id ?? 0, partIndex)}
                                                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                                                            activeTab[item.soutenance.id ?? 0] === partIndex
                                                                ? 'bg-red-600 text-white shadow-sm'
                                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        Partie {partIndex + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content */}
                                            {item.parts.map((part, partIndex) => {
                                                if (!part.id) return null;
                                                return (
                                                    <div
                                                        key={part.id}
                                                        className={`${activeTab[item.soutenance.id ?? 0] === partIndex ? 'block' : 'hidden'}`}
                                                    >
                                                        <div className="mb-4">
                                                            <h4 className="font-medium text-gray-900 text-sm mb-3 text-gray-700">
                                                                {part.description}
                                                            </h4>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {/* Notes Header */}
                                                            {item.notes.filter(note => note.soutenance_part_id === part.id).length > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                        </div>
                                                                        Notes d'évaluation
                                                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                                            {item.notes.filter(note => note.soutenance_part_id === part.id).length}
                                                                        </span>
                                                                    </h5>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Existing Notes */}
                                                            <div className="space-y-3">
                                                                {item.notes
                                                                    .filter(note => note.soutenance_part_id === part.id)
                                                                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                                                                    .map((note) => (
                                                                        <div key={note.id} className={`relative rounded-xl p-4 border transition-all duration-200 ${
                                                                            note.teacher_id === currentTeacherId 
                                                                                ? 'bg-red-50 border-red-200 shadow-sm' 
                                                                                : 'bg-gray-50 border-gray-200'
                                                                        }`}>
                                                                            {/* Note Header */}
                                                                            <div className="flex items-start justify-between mb-3">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                                                                        note.teacher_id === currentTeacherId 
                                                                                            ? 'bg-red-500 text-white' 
                                                                                            : 'bg-gray-500 text-white'
                                                                                    }`}>
                                                                                        {getTeacherName(note.teacher_id).split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <span className="font-medium text-gray-800 text-sm">
                                                                                                {getTeacherName(note.teacher_id)}
                                                                                            </span>
                                                                                            {note.teacher_id === currentTeacherId && (
                                                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                                                                    Ma note
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                            </svg>
                                                                                            {formatDate(note.updated_at || note.created_at!)}
                                                                                            {note.updated_at && note.updated_at !== note.created_at && (
                                                                                                <span className="text-orange-600 font-medium">(modifiée)</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Action Buttons */}
                                                                                {note.teacher_id === currentTeacherId && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button
                                                                                            onClick={() => setEditingNote({
                                                                                                soutenance_part_id: part.id ?? 0,
                                                                                                teacher_id: note.teacher_id,
                                                                                                note_text: note.note_text,
                                                                                                partDescription: part.description
                                                                                            })}
                                                                                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                                                                            title="Modifier la note"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                            </svg>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteNote(part.id ?? 0)}
                                                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                            title="Supprimer la note"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                            </svg>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Note Content */}
                                                                            <div className="mt-3">
                                                                                <div className="bg-white/80 rounded-lg p-3 border border-gray-200/50">
                                                                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                                                                        {note.note_text}
                                                                                    </p>
                                                                                </div>
                                                                                
                                                                                {/* Note Stats */}
                                                                                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                                                                    <span className="flex items-center gap-1">
                                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                                        </svg>
                                                                                        {note.note_text.length} caractères
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                                        </svg>
                                                                                        {note.note_text.split(' ').length} mots
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                            
                                                            {/* Add Note Button */}
                                                            {!hasTeacherNote(part.id ?? 0, item.notes) && (
                                                                <div className="mt-5 pt-4 border-t border-gray-100">
                                                                    <button
                                                                        onClick={() => setEditingNote({
                                                                            soutenance_part_id: part.id ?? 0,
                                                                            teacher_id: 0,
                                                                            note_text: '',
                                                                            partDescription: part.description
                                                                        })}
                                                                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                        </svg>
                                                                        Ajouter ma note d'évaluation
                                                                    </button>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Empty State for No Notes */}
                                                            {item.notes.filter(note => note.soutenance_part_id === part.id).length === 0 && hasTeacherNote(part.id ?? 0, item.notes) === false && (
                                                                <div className="text-center py-8">
                                                                    <p className="text-gray-500 text-sm mb-4">Aucune note d'évaluation pour cette partie</p>
                                                                    <button
                                                                        onClick={() => setEditingNote({
                                                                            soutenance_part_id: part.id ?? 0,
                                                                            teacher_id: 0,
                                                                            note_text: '',
                                                                            partDescription: part.description
                                                                        })}
                                                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                        </svg>
                                                                        Première évaluation
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Soutenance Modal */}
                <AddSoutenanceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateSoutenance}
                    currentTeacherId={currentTeacherId}
                />
            </div>

            {/* Add/Edit Note Modal */}
            <AddNoteModal
                isOpen={!!editingNote}
                onClose={() => {
                    setEditingNote(null);
                    setSuccessMessage(null); // Clear success message when closing modal
                }}
                onSubmit={async (noteData) => {
                    try {
                        if (editingNote?.teacher_id === 0) {
                            // For new notes, use the createNote function
                            await createNote({
                                soutenance_part_id: noteData.soutenance_part_id,
                                teacher_id: 0, // This will be set by the API to current teacher
                                note_text: noteData.note_text
                            });
                            setSuccessMessage('Note ajoutée avec succès!');
                        } else {
                            // For editing existing notes
                            await handleUpdateNote({
                                soutenance_part_id: noteData.soutenance_part_id,
                                teacher_id: editingNote?.teacher_id || 0,
                                note_text: noteData.note_text
                            });
                            setSuccessMessage('Note modifiée avec succès!');
                        }
                        
                        // Auto-hide success message after 3 seconds
                        setTimeout(() => setSuccessMessage(null), 3000);
                    } catch (error) {
                        console.error('Error handling note:', error);
                    }
                }}
                soutenancePartId={editingNote?.soutenance_part_id || 0}
                partDescription={editingNote?.partDescription}
                isEditing={editingNote?.teacher_id !== 0}
                initialNoteText={editingNote?.note_text || ''}
                isLoading={loading}
            />
        </div>
    );
}
