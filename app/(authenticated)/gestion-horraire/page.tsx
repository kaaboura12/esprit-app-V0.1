"use client"

import { 
  Clock, 
  Construction, 
  Calendar,
  AlertTriangle,
  Settings,
  Wrench,
  Loader2
} from 'lucide-react'

export default function GestionHorrairePage() {
    return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Horaires</h1>
                <p className="text-gray-600 mt-1">Configuration et gestion des créneaux horaires</p>
              </div>
            </div>
          </div>
        </div>

        {/* Under Development Content */}
        <div className="px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg overflow-hidden">
              {/* Hero Section */}
              <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-12 text-center">
                <div className="absolute top-6 left-6">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">En développement</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                    <Construction className="w-16 h-16 text-white" />
                  </div>
                  
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Page en construction
                  </h2>
                  
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Nous travaillons actuellement sur cette fonctionnalité pour vous offrir 
                    la meilleure expérience possible de gestion des horaires.
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 text-amber-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Développement en cours...</span>
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                  Fonctionnalités à venir
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Gestion des créneaux</h4>
                    <p className="text-gray-600 text-sm">
                      Configurez et gérez facilement les créneaux horaires pour tous vos cours.
                    </p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Planification avancée</h4>
                    <p className="text-gray-600 text-sm">
                      Outils de planification intelligente avec détection automatique des conflits.
                    </p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Configuration flexible</h4>
                    <p className="text-gray-600 text-sm">
                      Personnalisez les paramètres selon les besoins de votre établissement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
                  Calendrier de développement
                </h3>
                
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phase 1: Analyse des besoins</p>
                        <p className="text-sm text-gray-600">Terminée</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-amber-200 bg-amber-50">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phase 2: Développement de l'interface</p>
                        <p className="text-sm text-gray-600">En cours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 opacity-60">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phase 3: Tests et validation</p>
                        <p className="text-sm text-gray-600">À venir</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 opacity-60">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phase 4: Déploiement</p>
                        <p className="text-sm text-gray-600">À venir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="p-8 border-t border-gray-200 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Une question ou suggestion ?
                </h3>
                <p className="text-gray-600 mb-4">
                  N'hésitez pas à nous contacter pour tout retour ou suggestion concernant cette fonctionnalité.
                </p>
                <button className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg">
                  <span>Nous contacter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 