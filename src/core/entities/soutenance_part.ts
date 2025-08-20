export interface SoutenancePart {
    id?: number;
    soutenance_id: number;
    part_number: 1 | 2;
    description?: string;
    created_at?: Date;
}

export class SoutenancePartEntity implements SoutenancePart {
    id?: number;
    soutenance_id: number;
    part_number: 1 | 2;
    description?: string;
    created_at?: Date;

    constructor(data: SoutenancePart) {
        this.id = data.id;
        this.soutenance_id = data.soutenance_id;
        this.part_number = data.part_number;
        this.description = data.description;
        this.created_at = data.created_at;
    }

    static create(data: Omit<SoutenancePart, 'id' | 'created_at'>): SoutenancePartEntity {
        return new SoutenancePartEntity({
            ...data,
            created_at: new Date()
        });
    }

    static createPart1(soutenance_id: number, description?: string): SoutenancePartEntity {
        return new SoutenancePartEntity({
            soutenance_id,
            part_number: 1,
            description: description || 'Partie 1',
            created_at: new Date()
        });
    }

    static createPart2(soutenance_id: number, description?: string): SoutenancePartEntity {
        return new SoutenancePartEntity({
            soutenance_id,
            part_number: 2,
            description: description || 'Partie 2',
            created_at: new Date()
        });
    }

    update(data: Partial<Omit<SoutenancePart, 'id' | 'created_at'>>): void {
        Object.assign(this, data);
    }

    toJSON(): SoutenancePart {
        return {
            id: this.id,
            soutenance_id: this.soutenance_id,
            part_number: this.part_number,
            description: this.description,
            created_at: this.created_at
        };
    }
}
