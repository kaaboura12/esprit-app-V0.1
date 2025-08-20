import { SoutenanceRepository, SoutenancePartRepository, SoutenanceNoteRepository } from '../../core/interfaces';
import { SoutenanceEntity, SoutenancePartEntity, SoutenanceNoteEntity } from '../../core/entities';

export interface SoutenanceWithDetails {
    soutenance: SoutenanceEntity;
    parts: SoutenancePartEntity[];
    notes: SoutenanceNoteEntity[];
}

export class GetSoutenanceUseCase {
    constructor(
        private soutenanceRepository: SoutenanceRepository,
        private soutenancePartRepository: SoutenancePartRepository,
        private soutenanceNoteRepository: SoutenanceNoteRepository
    ) {}

    async getById(id: number): Promise<SoutenanceWithDetails | null> {
        const soutenance = await this.soutenanceRepository.findById(id);
        if (!soutenance) return null;

        const parts = await this.soutenancePartRepository.findBySoutenanceId(id);
        
        // Fetch notes for all parts
        const allNotes: SoutenanceNoteEntity[] = [];
        for (const part of parts) {
            if (part.id) {
                const partNotes = await this.soutenanceNoteRepository.findBySoutenancePartId(part.id);
                allNotes.push(...partNotes);
            }
        }

        return {
            soutenance,
            parts,
            notes: allNotes
        };
    }

    async getByStudentId(etudiant_id: number): Promise<SoutenanceWithDetails[]> {
        const soutenances = await this.soutenanceRepository.findByStudentId(etudiant_id);
        const results: SoutenanceWithDetails[] = [];

        for (const soutenance of soutenances) {
            const parts = await this.soutenancePartRepository.findBySoutenanceId(soutenance.id!);
            
            // Fetch notes for all parts
            const allNotes: SoutenanceNoteEntity[] = [];
            for (const part of parts) {
                if (part.id) {
                    const partNotes = await this.soutenanceNoteRepository.findBySoutenancePartId(part.id);
                    allNotes.push(...partNotes);
                }
            }

            results.push({
                soutenance,
                parts,
                notes: allNotes
            });
        }

        return results;
    }

    async getByTeacherId(teacher_id: number): Promise<SoutenanceWithDetails[]> {
        const soutenances = await this.soutenanceRepository.findByTeacherId(teacher_id);
        const results: SoutenanceWithDetails[] = [];

        for (const soutenance of soutenances) {
            const parts = await this.soutenancePartRepository.findBySoutenanceId(soutenance.id!);
            
            // Fetch notes for all parts
            const allNotes: SoutenanceNoteEntity[] = [];
            for (const part of parts) {
                if (part.id) {
                    const partNotes = await this.soutenanceNoteRepository.findBySoutenancePartId(part.id);
                    allNotes.push(...partNotes);
                }
            }

            results.push({
                soutenance,
                parts,
                notes: allNotes
            });
        }

        return results;
    }

    async getAll(): Promise<SoutenanceWithDetails[]> {
        const soutenances = await this.soutenanceRepository.findAll();
        const results: SoutenanceWithDetails[] = [];

        for (const soutenance of soutenances) {
            const parts = await this.soutenancePartRepository.findBySoutenanceId(soutenance.id!);
            
            // Fetch notes for all parts
            const allNotes: SoutenanceNoteEntity[] = [];
            for (const part of parts) {
                if (part.id) {
                    const partNotes = await this.soutenanceNoteRepository.findBySoutenancePartId(part.id);
                    allNotes.push(...partNotes);
                }
            }

            results.push({
                soutenance,
                parts,
                notes: allNotes
            });
        }

        return results;
    }
}
