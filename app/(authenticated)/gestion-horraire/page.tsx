"use client"

import React, { useState, useEffect } from 'react';
import { BookOpen, Calculator, Save, User, DollarSign, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';

const API_BASE_URL = '/api';

// Type definitions
type ShiftType = 'cours_de_jour' | 'alternance' | 'cours_de_soir';

interface Assignment {
  matiere_id: string;
  classe_id: string;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
}

interface WorkloadData {
  [key: string]: { [key: string]: Assignment };
}

interface Teacher {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Matiere {
  id: number;
  nommatiere: string;
}

interface Classe {
  id: number;
  nom_classe: string;
  bloc: string;
  numclasse: number;
}

interface HourlyRate {
  id: number;
  shiftType: ShiftType;
  rateType: 'heures_supp' | 'regular' | 'samedi' | 'soir';
  rateAmount: number;
  academicYear: string;
  isActive: boolean;
}

const GestionHoraire = () => {
  const { teacher, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ShiftType>('cours_de_jour');
  const [workloadData, setWorkloadData] = useState<WorkloadData>({
    cours_de_jour: {},
    alternance: {},
    cours_de_soir: {}
  });
  const [samediHours, setSamediHours] = useState(0);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [academicYear, setAcademicYear] = useState('');
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [hourlyRates, setHourlyRates] = useState<HourlyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Set current teacher from auth context
  useEffect(() => {
    if (teacher) {
      setCurrentTeacher({
        id: teacher.id,
        firstname: teacher.firstname || '',
        lastname: teacher.lastname || '',
        email: teacher.email || ''
      });
    }
  }, [teacher]);

  // Fetch initial data on component mount
  useEffect(() => {
    if (currentTeacher) {
      fetchInitialData();
    }
  }, [currentTeacher]);

  // Fetch workload data when teacher or academic year changes
  useEffect(() => {
    if (currentTeacher && academicYear) {
      fetchWorkloadData();
    }
  }, [currentTeacher, academicYear]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#ef4444]" />
          <span className="text-lg font-medium">Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Show error if no teacher is authenticated
  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-[#ef4444] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const fetchInitialData = async () => {
    if (!currentTeacher) return;
    
    try {
      setLoading(true);
      
      const matieresRes = await fetch(`${API_BASE_URL}/matieres`);
      if (!matieresRes.ok) {
        throw new Error(`Matieres API failed: ${matieresRes.status}`);
      }
      const matieresData = await matieresRes.json();
      console.log('Matieres API response:', matieresData);
      
      const classesRes = await fetch(`${API_BASE_URL}/classes`);
      if (!classesRes.ok) {
        throw new Error(`Classes API failed: ${classesRes.status}`);
      }
      const classesData = await classesRes.json();
      console.log('Classes API response:', classesData);
      
      // Fetch hourly rates for the current academic year
      const ratesRes = await fetch(`${API_BASE_URL}/hourly-rates?academicYear=2024-2025&isActive=true`);
      if (!ratesRes.ok) {
        throw new Error(`Hourly rates API failed: ${ratesRes.status}`);
      }
      const ratesData = await ratesRes.json();
      console.log('Hourly rates API response:', ratesData);
      
      // Ensure data is always an array and has the expected structure
      const safeMatieres = Array.isArray(matieresData) ? matieresData : [];
      const safeClasses = Array.isArray(classesData) ? classesData : [];
      const safeRates = Array.isArray(ratesData) ? ratesData : [];
      
      setMatieres(safeMatieres);
      setClasses(safeClasses);
      setHourlyRates(safeRates);
      setAcademicYear('2024-2025'); // Hardcoded for now
    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert('Erreur lors du chargement des données initiales');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloadData = async () => {
    if (!currentTeacher || !academicYear) return;

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/workload?academicYear=${encodeURIComponent(academicYear)}`);
      const data = await response.json();

      // Transform workload data back to the format expected by the UI
      const transformedData: WorkloadData = {
        cours_de_jour: {},
        alternance: {},
        cours_de_soir: {}
      };

      // Group workload by shift type and create assignment objects
      const workloadByAssignment: { [key: string]: Assignment } = {};
      data.workload.forEach((item: any) => {
        const key = `${item.matiere_id}-${item.classe_id}-${item.shift_type}`;
        if (!workloadByAssignment[key]) {
          workloadByAssignment[key] = {
            matiere_id: item.matiere_id,
            classe_id: item.classe_id,
            P1: 0,
            P2: 0,
            P3: 0,
            P4: 0
          };
        }
        const period = item.period as keyof Assignment;
        if (period === 'P1' || period === 'P2' || period === 'P3' || period === 'P4') {
          workloadByAssignment[key][period] = parseFloat(item.hours);
        }
      });

      // Organize by shift type
      Object.entries(workloadByAssignment).forEach(([key, assignment]) => {
        const shiftType = key.split('-')[2] as ShiftType;
        const uniqueKey = Date.now() + Math.random(); // Generate unique key for UI
        transformedData[shiftType][uniqueKey] = assignment;
      });

      setWorkloadData(transformedData);

      // Set samedi hours from alternance summary
      const alternanceSummary = data.summary.find((s: any) => s.shift_type === 'alternance');
      if (alternanceSummary) {
        setSamediHours(parseFloat(alternanceSummary.hours_samedi) || 0);
      }
    } catch (error) {
      console.error('Error fetching workload data:', error);
    }
  };

  const shifts = [
    { id: 'cours_de_jour' as ShiftType, label: 'Cours de Jour', color: 'bg-[#ef4444]' },
    { id: 'alternance' as ShiftType, label: 'Alternance', color: 'bg-[#ef4444]' },
    { id: 'cours_de_soir' as ShiftType, label: 'Cours de Soir', color: 'bg-[#ef4444]' }
  ];

  const periods = ['P1', 'P2', 'P3', 'P4'] as const;

  // Helper function to get hourly rate
  const getHourlyRate = (shiftType: ShiftType, rateType: 'heures_supp' | 'regular' | 'samedi' | 'soir'): number => {
    const rate = hourlyRates.find(r => 
      r.shiftType === shiftType && 
      r.rateType === rateType && 
      r.isActive
    );
    return rate ? rate.rateAmount : 0;
  };

  // Add new assignment
  const addAssignment = (shiftType: ShiftType) => {
    const newKey = Date.now();
    setWorkloadData(prev => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        [newKey]: {
          matiere_id: '',
          classe_id: '',
          P1: 0,
          P2: 0,
          P3: 0,
          P4: 0
        }
      }
    }));
  };

  // Update assignment
  const updateAssignment = (shiftType: ShiftType, key: string, field: string, value: string | number) => {
    setWorkloadData(prev => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        [key]: {
          ...prev[shiftType][key],
          [field]: field.startsWith('P') ? parseFloat(value.toString()) || 0 : value
        }
      }
    }));
  };

  // Delete assignment
  const deleteAssignment = (shiftType: ShiftType, key: string) => {
    setWorkloadData(prev => {
      const newData = { ...prev };
      delete newData[shiftType][key];
      return newData;
    });
  };

  // Calculate totals for a shift type
  const calculateShiftTotals = (shiftType: ShiftType) => {
    const assignments = workloadData[shiftType];
    let totals: { P1: number; P2: number; P3: number; P4: number } = { P1: 0, P2: 0, P3: 0, P4: 0 };
    
    Object.values(assignments).forEach(assignment => {
      periods.forEach(period => {
        totals[period] += assignment[period] || 0;
      });
    });
    
    const totalHours = totals.P1 + totals.P2 + totals.P3 + totals.P4;
    const semester1 = totals.P1 + totals.P2;
    const semester2 = totals.P3 + totals.P4;
    
    return { ...totals, totalHours, semester1, semester2 };
  };

  // Calculate payment and supplementary hours
  const calculatePaymentAndHours = () => {
    const jourTotals = calculateShiftTotals('cours_de_jour');
    const alternanceTotals = calculateShiftTotals('alternance');
    const soirTotals = calculateShiftTotals('cours_de_soir');

    // Get rates from database
    const suppRate = getHourlyRate('cours_de_jour', 'heures_supp');
    const regularRate = getHourlyRate('alternance', 'regular');
    const saturdayRate = getHourlyRate('alternance', 'samedi');
    const eveningRate = getHourlyRate('cours_de_soir', 'soir');

    // Cours de Jour calculations
    const jourCreneauxS1 = jourTotals.semester1 / 42;
    const jourCreneauxS2 = jourTotals.semester2 / 42;
    const jourHeuresSupp = Math.max(0, jourTotals.totalHours - 378);
    const jourMontant = jourHeuresSupp * suppRate;

    // Alternance calculations
    let alternanceMontant = 0;
    if (samediHours === 0) {
      alternanceMontant = alternanceTotals.totalHours * regularRate;
    } else {
      const simpleHours = alternanceTotals.totalHours - samediHours;
      alternanceMontant = (simpleHours * regularRate) + (samediHours * saturdayRate);
    }

    // Cours de Soir calculations
    const soirMontant = soirTotals.totalHours * eveningRate;

    // Annual totals
    const totalHeuresSupp = jourHeuresSupp + alternanceTotals.totalHours + soirTotals.totalHours;
    const totalMontant = jourMontant + alternanceMontant + soirMontant;

    return {
      jour: { 
        creneauxS1: jourCreneauxS1, 
        creneauxS2: jourCreneauxS2, 
        heuresSupp: jourHeuresSupp, 
        montant: jourMontant 
      },
      alternance: { montant: alternanceMontant },
      soir: { montant: soirMontant },
      annual: { totalHeuresSupp, totalMontant },
      rates: {
        suppRate,
        regularRate,
        saturdayRate,
        eveningRate
      }
    };
  };

  const calculations = calculatePaymentAndHours();

  // Render assignment row
  const renderAssignmentRow = (shiftType: ShiftType, key: string, assignment: Assignment) => (
    <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-3">
        <select
          value={assignment.matiere_id}
          onChange={(e) => updateAssignment(shiftType, key, 'matiere_id', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Sélectionner une matière</option>
          {matieres.map(matiere => (
            <option key={matiere.id} value={matiere.id}>{matiere.nommatiere}</option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <select
          value={assignment.classe_id}
          onChange={(e) => updateAssignment(shiftType, key, 'classe_id', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Sélectionner une classe</option>
          {classes.map(classe => (
            <option key={classe.id} value={classe.id}>{classe.nom_classe}</option>
          ))}
        </select>
      </td>
      {periods.map(period => (
        <td key={period} className="p-3">
          <input
            type="number"
            value={assignment[period]}
            onChange={(e) => updateAssignment(shiftType, key, period, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-center"
            min="0"
            step="0.5"
          />
        </td>
      ))}
      <td className="p-3 text-center font-semibold">
        {(assignment.P1 + assignment.P2 + assignment.P3 + assignment.P4).toFixed(1)}
      </td>
      <td className="p-3">
        <button
          onClick={() => deleteAssignment(shiftType, key)}
          className="text-red-600 hover:text-red-800 font-semibold"
        >
          Supprimer
        </button>
      </td>
    </tr>
  );

  // Render shift tab content
  const renderShiftContent = (shiftType: ShiftType) => {
    const assignments = workloadData[shiftType];
    const totals = calculateShiftTotals(shiftType);
    const shift = shifts.find(s => s.id === shiftType);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <div className={`w-4 h-4 ${shift?.color} rounded mr-3`}></div>
            {shift?.label}
          </h2>
          <button
            onClick={() => addAssignment(shiftType)}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f3f4f6]">
                <th className="p-3 text-left">Matière</th>
                <th className="p-3 text-left">Classe</th>
                {periods.map(period => (
                  <th key={period} className="p-3 text-center">{period}</th>
                ))}
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(assignments).map(([key, assignment]) => 
                renderAssignmentRow(shiftType, key, assignment)
              )}
              {Object.keys(assignments).length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6b7280]">
                    Aucune affectation. Cliquez sur "Ajouter" pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-[#f3f4f6]">
              <tr>
                <th colSpan={2} className="p-3 text-right">Totaux:</th>
                {periods.map(period => (
                  <th key={period} className="p-3 text-center font-bold text-[#ef4444]">
                    {totals[period].toFixed(1)}
                  </th>
                ))}
                <th className="p-3 text-center font-bold text-[#ef4444]">
                  {totals.totalHours.toFixed(1)}
                </th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Calculations for this shift */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f3f4f6] p-4 rounded-lg">
            <div className="text-sm text-[#374151] mb-1">Semestre 1 (P1+P2)</div>
            <div className="text-xl font-bold text-[#ef4444]">{totals.semester1.toFixed(1)}h</div>
          </div>
          <div className="bg-[#f3f4f6] p-4 rounded-lg">
            <div className="text-sm text-[#374151] mb-1">Semestre 2 (P3+P4)</div>
            <div className="text-xl font-bold text-[#ef4444]">{totals.semester2.toFixed(1)}h</div>
          </div>
          {shiftType === 'cours_de_jour' && (
            <>
              <div className="bg-[#f3f4f6] p-4 rounded-lg">
                <div className="text-sm text-[#374151] mb-1">Créneaux S1</div>
                <div className={`text-xl font-bold ${calculations.jour.creneauxS1 > 9 ? 'text-[#ef4444]' : 'text-[#374151]'}`}>
                  {calculations.jour.creneauxS1.toFixed(2)}
                  {calculations.jour.creneauxS1 > 9 && <AlertTriangle className="inline w-4 h-4 ml-1" />}
                </div>
              </div>
              <div className="bg-[#f3f4f6] p-4 rounded-lg">
                <div className="text-sm text-[#374151] mb-1">Créneaux S2</div>
                <div className={`text-xl font-bold ${calculations.jour.creneauxS2 > 9 ? 'text-[#ef4444]' : 'text-[#374151]'}`}>
                  {calculations.jour.creneauxS2.toFixed(2)}
                  {calculations.jour.creneauxS2 > 9 && <AlertTriangle className="inline w-4 h-4 ml-1" />}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Special fields for alternance */}
        {shiftType === 'alternance' && (
          <div className="mt-6 bg-[#f3f4f6] p-4 rounded-lg">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Heures Samedi:
            </label>
            <input
              type="number"
              value={samediHours}
              onChange={(e) => setSamediHours(parseFloat(e.target.value) || 0)}
              className="w-32 p-2 border border-[#e5e7eb] rounded"
              min="0"
              step="0.5"
            />
            <div className="text-sm text-[#374151] mt-2">
              {samediHours === 0 ? 
                `Paiement normal: ${calculations.rates.regularRate}€/heure` : 
                `Heures normales: ${(totals.totalHours - samediHours).toFixed(1)}h à ${calculations.rates.regularRate}€ + Samedi: ${samediHours}h à ${calculations.rates.saturdayRate}€`
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  const saveWorkload = async () => {
    if (!currentTeacher || !academicYear) {
      alert('Erreur: Professeur ou année académique manquant');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        workload: workloadData,
        samedi_hours: samediHours
      };
      
      console.log('Sending payload to API:', payload); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/teacher/workload?academicYear=${encodeURIComponent(academicYear)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Charge de travail sauvegardée avec succès!');
        // Refresh data to get updated calculations
        await fetchWorkloadData();
      } else {
        const errorData = await response.json();
        console.error('API Error Response:', errorData); // Debug log
        alert(`Erreur lors de la sauvegarde: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving workload:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#ef4444]" />
          <span className="text-lg font-medium">Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100">
        {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-[#e5e7eb] sticky top-0 z-40">
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestion Horaire</h1>
                <p className="text-[#6b7280] mt-1 text-sm sm:text-base">Année académique {academicYear}</p>
              </div>
            </div>
          </div>
                  </div>
                </div>
                
      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-[#e5e7eb]">
            <nav className="flex space-x-8">
              {shifts.map(shift => (
                <button
                  key={shift.id}
                  onClick={() => setActiveTab(shift.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === shift.id
                      ? 'border-[#ef4444] text-[#ef4444]'
                      : 'border-transparent text-[#6b7280] hover:text-[#374151] hover:border-[#d1d5db]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${shift.color} rounded`}></div>
                    <span>{shift.label}</span>
                  </div>
                </button>
              ))}
            </nav>
                </div>
              </div>

        {/* Tab Content */}
        {renderShiftContent(activeTab)}

        {/* Current Rates Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-[#ef4444]" />
            Tarifs Horaire Actuels ({academicYear})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <div className="text-sm text-[#374151] mb-1">Heures Supplémentaires</div>
              <div className="text-xl font-bold text-[#ef4444]">{calculations.rates.suppRate}€/h</div>
              <div className="text-xs text-[#6b7280]">Cours de jour</div>
            </div>
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <div className="text-sm text-[#374151] mb-1">Heures Régulières</div>
              <div className="text-xl font-bold text-[#ef4444]">{calculations.rates.regularRate}€/h</div>
              <div className="text-xs text-[#6b7280]">Alternance</div>
            </div>
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <div className="text-sm text-[#374151] mb-1">Heures Samedi</div>
              <div className="text-xl font-bold text-[#ef4444]">{calculations.rates.saturdayRate}€/h</div>
              <div className="text-xs text-[#6b7280]">Alternance</div>
            </div>
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <div className="text-sm text-[#374151] mb-1">Cours de Soir</div>
              <div className="text-xl font-bold text-[#ef4444]">{calculations.rates.eveningRate}€/h</div>
              <div className="text-xs text-[#6b7280]">Soir</div>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-[#ef4444]" />
            Résumé des Calculs
                </h3>
                
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cours de Jour Summary */}
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <h4 className="font-semibold text-[#374151] mb-3">Cours de Jour</h4>
              <div className="space-y-2 text-sm">
                <div>Heures Supp: <span className="font-bold">{calculations.jour.heuresSupp.toFixed(1)}h</span></div>
                <div>Montant: <span className="font-bold text-[#ef4444]">{calculations.jour.montant.toFixed(2)}€</span></div>
                <div>Créneaux S1: <span className={`font-bold ${calculations.jour.creneauxS1 > 9 ? 'text-[#ef4444]' : 'text-[#374151]'}`}>
                  {calculations.jour.creneauxS1.toFixed(2)}
                </span></div>
                <div>Créneaux S2: <span className={`font-bold ${calculations.jour.creneauxS2 > 9 ? 'text-[#ef4444]' : 'text-[#374151]'}`}>
                  {calculations.jour.creneauxS2.toFixed(2)}
                </span></div>
                      </div>
                    </div>
                    
            {/* Alternance Summary */}
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <h4 className="font-semibold text-[#374151] mb-3">Alternance</h4>
              <div className="space-y-2 text-sm">
                <div>Total Heures: <span className="font-bold">{calculateShiftTotals('alternance').totalHours.toFixed(1)}h</span></div>
                <div>Heures Samedi: <span className="font-bold">{samediHours.toFixed(1)}h</span></div>
                <div>Montant: <span className="font-bold text-[#ef4444]">{calculations.alternance.montant.toFixed(2)}€</span></div>
                      </div>
                    </div>
                    
            {/* Cours de Soir Summary */}
            <div className="bg-[#f3f4f6] p-4 rounded-lg">
              <h4 className="font-semibold text-[#374151] mb-3">Cours de Soir</h4>
              <div className="space-y-2 text-sm">
                <div>Total Heures: <span className="font-bold">{calculateShiftTotals('cours_de_soir').totalHours.toFixed(1)}h</span></div>
                <div>Prix/Heure: <span className="font-bold">{calculations.rates.eveningRate}€</span></div>
                <div>Montant: <span className="font-bold text-[#ef4444]">{calculations.soir.montant.toFixed(2)}€</span></div>
                      </div>
                    </div>
                    
            {/* Annual Total */}
            <div className="bg-[#f3f4f6] p-4 rounded-lg border-2 border-[#e5e7eb]">
              <h4 className="font-semibold text-[#374151] mb-3">Total Annuel</h4>
              <div className="space-y-2 text-sm">
                <div>Heures Supp Année: <span className="font-bold">{calculations.annual.totalHeuresSupp.toFixed(1)}h</span></div>
                <div className="border-t border-[#e5e7eb] pt-2 mt-2">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-bold text-lg text-[#ef4444]">{calculations.annual.totalMontant.toFixed(2)}€</span>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#6b7280]">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Prix de l'heure: {calculations.rates.suppRate}€ (heures supp), {calculations.rates.regularRate}€ (alternance), {calculations.rates.saturdayRate}€ (samedi), {calculations.rates.eveningRate}€ (soir)</span>
                </div>
                <div>Maximum 9 créneaux par semestre</div>
              </div>
            </div>
            <button
              onClick={saveWorkload}
              disabled={saving || !currentTeacher}
              className="bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#9ca3af] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionHoraire; 