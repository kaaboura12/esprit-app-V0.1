import { SoutenanceRepository } from '../../core/interfaces/index';
import { Soutenance, SoutenanceEntity } from '../../core/entities';

export interface CreateSoutenanceRequest {
    etudiant_id: number;
    teacher_id: number;
    date_soutenance: Date;
    sujet?: string;
}

export interface CreateSoutenanceResponse {
    soutenance: SoutenanceEntity;
}

export class CreateSoutenanceUseCase {
    constructor(
        private soutenanceRepository: SoutenanceRepository
    ) {}

    async execute(request: CreateSoutenanceRequest): Promise<CreateSoutenanceResponse> {
        // Create the soutenance
        const soutenance = SoutenanceEntity.create(request);
        const createdSoutenance = await this.soutenanceRepository.create(soutenance);

        // Database trigger automatically creates the default parts
        return {
            soutenance: createdSoutenance
        };
    }
}
