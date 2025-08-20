export interface SoutenanceNote {
    id?: number;
    soutenance_part_id: number;
    teacher_id: number;
    note_text: string;
    created_at?: Date;
    updated_at?: Date;
}

export class SoutenanceNoteEntity implements SoutenanceNote {
    id?: number;
    soutenance_part_id: number;
    teacher_id: number;
    note_text: string;
    created_at?: Date;
    updated_at?: Date;

    constructor(data: SoutenanceNote) {
        this.id = data.id;
        this.soutenance_part_id = data.soutenance_part_id;
        this.teacher_id = data.teacher_id;
        this.note_text = data.note_text;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static create(data: Omit<SoutenanceNote, 'id' | 'created_at' | 'updated_at'>): SoutenanceNoteEntity {
        return new SoutenanceNoteEntity({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    update(data: Partial<Omit<SoutenanceNote, 'id' | 'created_at'>>): void {
        Object.assign(this, data);
        this.updated_at = new Date();
    }

    updateNoteText(note_text: string): void {
        this.note_text = note_text;
        this.updated_at = new Date();
    }

    toJSON(): SoutenanceNote {
        return {
            id: this.id,
            soutenance_part_id: this.soutenance_part_id,
            teacher_id: this.teacher_id,
            note_text: this.note_text,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
