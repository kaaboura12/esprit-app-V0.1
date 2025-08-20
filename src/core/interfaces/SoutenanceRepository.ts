import { Soutenance, SoutenanceEntity } from '../entities';

export interface SoutenanceRepository {
    create(soutenance: Soutenance): Promise<SoutenanceEntity>;
    findById(id: number): Promise<SoutenanceEntity | null>;
    findByStudentId(etudiant_id: number): Promise<SoutenanceEntity[]>;
    findByTeacherId(teacher_id: number): Promise<SoutenanceEntity[]>;
    findAll(): Promise<SoutenanceEntity[]>;
    update(id: number, soutenance: Partial<Soutenance>): Promise<SoutenanceEntity | null>;
    delete(id: number): Promise<boolean>;
    findByDateRange(startDate: Date, endDate: Date): Promise<SoutenanceEntity[]>;
    findByStudentAndTeacher(etudiant_id: number, teacher_id: number): Promise<SoutenanceEntity | null>;
}
