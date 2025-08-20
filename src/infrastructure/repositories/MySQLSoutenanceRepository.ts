import { SoutenanceRepository } from '../../core/interfaces/SoutenanceRepository';
import { Soutenance, SoutenanceEntity } from '../../core/entities';
import { supabase } from '../config/supabaseClient';

export class MySQLSoutenanceRepository implements SoutenanceRepository {
    async create(soutenance: Soutenance): Promise<SoutenanceEntity> {
        // Extract only the fields we want to insert, excluding id and timestamps
        const { id, created_at, updated_at, ...insertData } = soutenance;
        
        // Ensure date is properly formatted for database
        const formattedData = {
            ...insertData,
            date_soutenance: insertData.date_soutenance instanceof Date 
                ? insertData.date_soutenance.toISOString().split('T')[0]
                : insertData.date_soutenance
        };
        
        const { data, error } = await supabase
            .from('soutenance')
            .insert([formattedData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating soutenance:', error);
            throw new Error(`Failed to create soutenance: ${error.message}`);
        }
        
        if (!data) {
            throw new Error('No data returned after creating soutenance');
        }
        
        return new SoutenanceEntity(data);
    }

    async findById(id: number): Promise<SoutenanceEntity | null> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance: ${error.message}`);
        return data ? new SoutenanceEntity(data) : null;
    }

    async findByStudentId(etudiant_id: number): Promise<SoutenanceEntity[]> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .eq('etudiant_id', etudiant_id)
            .order('date_soutenance', { ascending: false });

        if (error) throw new Error(`Failed to find soutenances by student: ${error.message}`);
        return data?.map(item => new SoutenanceEntity(item)) || [];
    }

    async findByTeacherId(teacher_id: number): Promise<SoutenanceEntity[]> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .eq('teacher_id', teacher_id)
            .order('date_soutenance', { ascending: false });

        if (error) throw new Error(`Failed to find soutenances by teacher: ${error.message}`);
        return data?.map(item => new SoutenanceEntity(item)) || [];
    }

    async findAll(): Promise<SoutenanceEntity[]> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .order('date_soutenance', { ascending: false });

        if (error) throw new Error(`Failed to find all soutenances: ${error.message}`);
        return data?.map(item => new SoutenanceEntity(item)) || [];
    }

    async update(id: number, soutenance: Partial<Soutenance>): Promise<SoutenanceEntity | null> {
        // Extract only the fields we want to update, excluding id and timestamps
        const { id: _, created_at, updated_at, ...updateData } = soutenance;
        
        const { data, error } = await supabase
            .from('soutenance')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to update soutenance: ${error.message}`);
        return data ? new SoutenanceEntity(data) : null;
    }

    async delete(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('soutenance')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete soutenance: ${error.message}`);
        return true;
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<SoutenanceEntity[]> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .gte('date_soutenance', startDate.toISOString().split('T')[0])
            .lte('date_soutenance', endDate.toISOString().split('T')[0])
            .order('date_soutenance', { ascending: true });

        if (error) throw new Error(`Failed to find soutenances by date range: ${error.message}`);
        return data?.map(item => new SoutenanceEntity(item)) || [];
    }

    async findByStudentAndTeacher(etudiant_id: number, teacher_id: number): Promise<SoutenanceEntity | null> {
        const { data, error } = await supabase
            .from('soutenance')
            .select('*')
            .eq('etudiant_id', etudiant_id)
            .eq('teacher_id', teacher_id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance by student and teacher: ${error.message}`);
        return data ? new SoutenanceEntity(data) : null;
    }
}
