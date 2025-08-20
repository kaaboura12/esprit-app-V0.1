import { SoutenanceNoteRepository } from '../../core/interfaces';
import { SoutenanceNote, SoutenanceNoteEntity } from '../../core/entities';

export interface UpdateSoutenanceNoteRequest {
    soutenance_part_id: number;
    teacher_id: number;
    note_text: string;
}

export class UpdateSoutenanceNoteUseCase {
    constructor(
        private soutenanceNoteRepository: SoutenanceNoteRepository
    ) {}

    async execute(request: UpdateSoutenanceNoteRequest): Promise<SoutenanceNoteEntity> {
        // Try to find existing note
        const existingNote = await this.soutenanceNoteRepository.findBySoutenancePartAndTeacher(
            request.soutenance_part_id,
            request.teacher_id
        );

        if (existingNote) {
            // Update existing note
            const updatedNote = await this.soutenanceNoteRepository.update(
                existingNote.id!,
                { note_text: request.note_text }
            );
            if (!updatedNote) throw new Error('Failed to update soutenance note');
            return updatedNote;
        } else {
            // Create new note
            const newNote = SoutenanceNoteEntity.create(request);
            return await this.soutenanceNoteRepository.create(newNote);
        }
    }

    async deleteNote(soutenance_part_id: number, teacher_id: number): Promise<boolean> {
        const existingNote = await this.soutenanceNoteRepository.findBySoutenancePartAndTeacher(
            soutenance_part_id,
            teacher_id
        );

        if (!existingNote) return false;

        return await this.soutenanceNoteRepository.delete(existingNote.id!);
    }
}
