import { SoutenanceNoteRepository } from '../../core/interfaces/SoutenanceNoteRepository';
import { SoutenanceNote, SoutenanceNoteEntity } from '../../core/entities';
import { supabase } from '../config/supabaseClient';

export class MySQLSoutenanceNoteRepository implements SoutenanceNoteRepository {
    async create(soutenanceNote: SoutenanceNote): Promise<SoutenanceNoteEntity> {
        // Remove id field when creating new note to let database auto-increment handle it
        const { id, ...noteData } = soutenanceNote;
        

        
        const { data, error } = await supabase
            .from('soutenance_note')
            .insert([noteData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating soutenance note:', error);
            throw new Error(`Failed to create soutenance note: ${error.message}`);
        }
        
        if (!data) {
            throw new Error('No data returned after creating soutenance note');
        }
        

        return new SoutenanceNoteEntity(data);
    }

    async findById(id: number): Promise<SoutenanceNoteEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance note: ${error.message}`);
        return data ? new SoutenanceNoteEntity(data) : null;
    }

    async findBySoutenancePartId(soutenance_part_id: number): Promise<SoutenanceNoteEntity[]> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .select('*')
            .eq('soutenance_part_id', soutenance_part_id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to find soutenance notes by part: ${error.message}`);
        return data?.map(item => new SoutenanceNoteEntity(item)) || [];
    }

    async findByTeacherId(teacher_id: number): Promise<SoutenanceNoteEntity[]> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .select('*')
            .eq('teacher_id', teacher_id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to find soutenance notes by teacher: ${error.message}`);
        return data?.map(item => new SoutenanceNoteEntity(item)) || [];
    }

    async findBySoutenancePartAndTeacher(soutenance_part_id: number, teacher_id: number): Promise<SoutenanceNoteEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .select('*')
            .eq('soutenance_part_id', soutenance_part_id)
            .eq('teacher_id', teacher_id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to find soutenance note by part and teacher: ${error.message}`);
        return data ? new SoutenanceNoteEntity(data) : null;
    }

    async findAll(): Promise<SoutenanceNoteEntity[]> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to find all soutenance notes: ${error.message}`);
        return data?.map(item => new SoutenanceNoteEntity(item)) || [];
    }

    async update(id: number, soutenanceNote: Partial<SoutenanceNote>): Promise<SoutenanceNoteEntity | null> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .update(soutenanceNote)
            .eq('id', id)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(`Failed to update soutenance note: ${error.message}`);
        return data ? new SoutenanceNoteEntity(data) : null;
    }

    async delete(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('soutenance_note')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete soutenance note: ${error.message}`);
        return true;
    }

    async upsert(soutenanceNote: SoutenanceNote): Promise<SoutenanceNoteEntity> {
        const { data, error } = await supabase
            .from('soutenance_note')
            .upsert([soutenanceNote], {
                onConflict: 'soutenance_part_id,teacher_id'
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to upsert soutenance note: ${error.message}`);
        return new SoutenanceNoteEntity(data);
    }
}
