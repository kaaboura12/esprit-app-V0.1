import { SoutenancePart, SoutenancePartEntity } from '../entities';

export interface SoutenancePartRepository {
    create(soutenancePart: SoutenancePart): Promise<SoutenancePartEntity>;
    findById(id: number): Promise<SoutenancePartEntity | null>;
    findBySoutenanceId(soutenance_id: number): Promise<SoutenancePartEntity[]>;
    findBySoutenanceIdAndPart(soutenance_id: number, part_number: 1 | 2): Promise<SoutenancePartEntity | null>;
    findAll(): Promise<SoutenancePartEntity[]>;
    update(id: number, soutenancePart: Partial<SoutenancePart>): Promise<SoutenancePartEntity | null>;
    delete(id: number): Promise<boolean>;
    createDefaultParts(soutenance_id: number): Promise<SoutenancePartEntity[]>;
}
