'use client';

import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteData: { soutenance_part_id: number; note_text: string }) => Promise<void>;
  soutenancePartId: number;
  partDescription?: string;
  isEditing?: boolean;
  initialNoteText?: string;
  isLoading?: boolean;
}

export function AddNoteModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  soutenancePartId,
  partDescription, 
  isEditing = false,
  initialNoteText = '',
  isLoading = false 
}: AddNoteModalProps) {
  const [noteText, setNoteText] = useState(initialNoteText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isSubmitting) {
      setNoteText(initialNoteText);
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteText.trim()) {
      setError('Le contenu de la note ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ 
        soutenance_part_id: soutenancePartId,
        note_text: noteText.trim() 
      });
      
      setNoteText('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-red-50 to-red-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Modifier ma note' : 'Ajouter une note'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing 
                  ? 'Modifiez le contenu de votre note' 
                  : 'Ajoutez votre évaluation pour cette partie'
                }
              </p>
              {partDescription && (
                <p className="text-xs text-gray-500 mt-1">
                  Partie: {partDescription}
                </p>
              )}
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

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contenu de la note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={8}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
              placeholder="Entrez votre note détaillée ici... Décrivez les points forts, les améliorations possibles, et donnez votre évaluation globale."
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              Soyez constructif et précis dans vos commentaires.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !noteText.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>💾 {isEditing ? 'Modifier' : 'Ajouter'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
