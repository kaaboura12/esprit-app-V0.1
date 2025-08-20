export interface SoutenanceDTO {
    id?: number;
    etudiant_id: number;
    teacher_id: number;
    date_soutenance: string; // ISO date string
    sujet?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SoutenancePartDTO {
    id?: number;
    soutenance_id: number;
    part_number: 1 | 2;
    description?: string;
    created_at?: string;
}

export interface SoutenanceNoteDTO {
    id?: number;
    soutenance_part_id: number;
    teacher_id: number;
    note_text: string;
    created_at?: string;
    updated_at?: string;
}

export interface SoutenanceWithDetailsDTO {
    soutenance: SoutenanceDTO;
    parts: SoutenancePartDTO[];
    notes: SoutenanceNoteDTO[];
}

export interface CreateSoutenanceDTO {
    etudiant_id: number;
    teacher_id: number;
    date_soutenance: string;
    sujet?: string;
}

export interface UpdateSoutenanceNoteDTO {
    soutenance_part_id: number;
    teacher_id: number;
    note_text: string;
}
