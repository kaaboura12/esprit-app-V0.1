import { useState, useEffect, useCallback } from 'react';
import { SoutenanceEntity, SoutenancePartEntity, SoutenanceNoteEntity } from '../../core/entities';
import { CreateSoutenanceRequest, UpdateSoutenanceNoteRequest } from '../../application/use-cases/index';

interface SoutenanceWithDetails {
    soutenance: SoutenanceEntity;
    parts: SoutenancePartEntity[];
    notes: SoutenanceNoteEntity[];
}

interface UseSoutenanceReturn {
    soutenances: SoutenanceWithDetails[];
    loading: boolean;
    error: string | null;
    createSoutenance: (request: CreateSoutenanceRequest) => Promise<void>;
    createNote: (request: UpdateSoutenanceNoteRequest) => Promise<void>;
    updateNote: (request: UpdateSoutenanceNoteRequest) => Promise<void>;
    deleteNote: (soutenance_part_id: number, teacher_id: number) => Promise<void>;
    refreshSoutenances: () => Promise<void>;
}

export const useSoutenance = (): UseSoutenanceReturn => {
    const [soutenances, setSoutenances] = useState<SoutenanceWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSoutenances = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/soutenance', {
                credentials: 'include' // Include cookies for authentication
            });
            if (!response.ok) {
                throw new Error('Failed to fetch soutenances');
            }
            
            const data = await response.json();
            setSoutenances(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const createSoutenance = useCallback(async (request: CreateSoutenanceRequest) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/soutenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(request),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create soutenance');
            }
            
            await fetchSoutenances();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSoutenances]);

    const createNote = useCallback(async (request: UpdateSoutenanceNoteRequest) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/soutenance/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(request),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create note');
            }
            
            await fetchSoutenances();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSoutenances]);

    const updateNote = useCallback(async (request: UpdateSoutenanceNoteRequest) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/soutenance/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(request),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update note');
            }
            
            await fetchSoutenances();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSoutenances]);

    const deleteNote = useCallback(async (soutenance_part_id: number, teacher_id: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/soutenance/notes', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ soutenance_part_id, teacher_id }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            
            await fetchSoutenances();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSoutenances]);

    const refreshSoutenances = useCallback(async () => {
        await fetchSoutenances();
    }, [fetchSoutenances]);

    useEffect(() => {
        fetchSoutenances();
    }, [fetchSoutenances]);

    return {
        soutenances,
        loading,
        error,
        createSoutenance,
        createNote,
        updateNote,
        deleteNote,
        refreshSoutenances,
    };
};
