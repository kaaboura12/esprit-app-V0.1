import { SoutenanceNote, SoutenanceNoteEntity } from '../entities';

export interface SoutenanceNoteRepository {
    create(soutenanceNote: SoutenanceNote): Promise<SoutenanceNoteEntity>;
    findById(id: number): Promise<SoutenanceNoteEntity | null>;
    findBySoutenancePartId(soutenance_part_id: number): Promise<SoutenanceNoteEntity[]>;
    findByTeacherId(teacher_id: number): Promise<SoutenanceNoteEntity[]>;
    findBySoutenancePartAndTeacher(soutenance_part_id: number, teacher_id: number): Promise<SoutenanceNoteEntity | null>;
    findAll(): Promise<SoutenanceNoteEntity[]>;
    update(id: number, soutenanceNote: Partial<SoutenanceNote>): Promise<SoutenanceNoteEntity | null>;
    delete(id: number): Promise<boolean>;
    upsert(soutenanceNote: SoutenanceNote): Promise<SoutenanceNoteEntity>;
}
