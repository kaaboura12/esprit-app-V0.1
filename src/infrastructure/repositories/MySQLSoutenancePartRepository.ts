import { SoutenancePartRepository } from '../../core/interfaces/SoutenancePartRepository';
import { SoutenancePart, SoutenancePartEntity } from '../../core/entities';
import { supabase } from '../config/supabaseClient';

export class MySQLSoutenancePartRepository implements SoutenancePartRepository {
    async create(soutenancePart: SoutenancePart): Promise<SoutenancePartEntity> {
        // Remove id field when creating new part to let database auto-increment handle it
        const { id, ...partData } = soutenancePart;
        
        console.log('Creating soutenance part with data:', partData);
        
        const { data, error } = await supabase
            .from('soutenance_part')
            .insert([partData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating soutenance part:', error);
            throw new Error(`Failed to create soutenance part: ${error.message}`);
        }
        
        if (!data) {
            throw new Error('No data returned after creating soutenance part');
        }
        
        console.log('Successfully created soutenance part:', data);
        return new SoutenancePartEntity(data);
    }

    async findById(id: number): Promise<SoutenancePartEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_part')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance part: ${error.message}`);
        return data ? new SoutenancePartEntity(data) : null;
    }

    async findBySoutenanceId(soutenance_id: number): Promise<SoutenancePartEntity[]> {
        const { data, error } = await supabase
            .from('soutenance_part')
            .select('*')
            .eq('soutenance_id', soutenance_id)
            .order('part_number', { ascending: true });

        if (error) throw new Error(`Failed to find soutenance parts by soutenance: ${error.message}`);
        return data?.map(item => new SoutenancePartEntity(item)) || [];
    }

    async findBySoutenanceIdAndPart(soutenance_id: number, part_number: 1 | 2): Promise<SoutenancePartEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_part')
            .select('*')
            .eq('soutenance_id', soutenance_id)
            .eq('part_number', part_number)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance part: ${error.message}`);
        return data ? new SoutenancePartEntity(data) : null;
    }

    async findAll(): Promise<SoutenancePartEntity[]> {
        const { data, error } = await supabase
            .from('soutenance_part')
            .select('*')
            .order('soutenance_id', { ascending: true })
            .order('part_number', { ascending: true });

        if (error) throw new Error(`Failed to find all soutenance parts: ${error.message}`);
        return data?.map(item => new SoutenancePartEntity(item)) || [];
    }

    async update(id: number, soutenancePart: Partial<SoutenancePart>): Promise<SoutenancePartEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_part')
            .update(soutenancePart)
            .eq('id', id)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to update soutenance part: ${error.message}`);
        return data ? new SoutenancePartEntity(data) : null;
    }

    async delete(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('soutenance_part')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete soutenance part: ${error.message}`);
        return true;
    }

    async createDefaultParts(soutenance_id: number): Promise<SoutenancePartEntity[]> {
        const part1 = SoutenancePartEntity.createPart1(soutenance_id);
        const part2 = SoutenancePartEntity.createPart2(soutenance_id);

        const [createdPart1, createdPart2] = await Promise.all([
            this.create(part1),
            this.create(part2)
        ]);

        return [createdPart1, createdPart2];
    }
}
