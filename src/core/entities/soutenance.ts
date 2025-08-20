export interface Soutenance {
    id?: number;
    etudiant_id: number;
    teacher_id: number;
    date_soutenance: Date;
    sujet?: string;
    created_at?: Date;
    updated_at?: Date;
}

export class SoutenanceEntity implements Soutenance {
    id?: number;
    etudiant_id: number;
    teacher_id: number;
    date_soutenance: Date;
    sujet?: string;
    created_at?: Date;
    updated_at?: Date;

    constructor(data: Soutenance) {
        this.id = data.id;
        this.etudiant_id = data.etudiant_id;
        this.teacher_id = data.teacher_id;
        this.date_soutenance = data.date_soutenance;
        this.sujet = data.sujet;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static create(data: Omit<Soutenance, 'id' | 'created_at' | 'updated_at'>): SoutenanceEntity {
        return new SoutenanceEntity({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    update(data: Partial<Omit<Soutenance, 'id' | 'created_at'>>): void {
        Object.assign(this, data);
        this.updated_at = new Date();
    }

    toJSON(): Soutenance {
        return {
            id: this.id,
            etudiant_id: this.etudiant_id,
            teacher_id: this.teacher_id,
            date_soutenance: this.date_soutenance,
            sujet: this.sujet,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
