import { NextRequest, NextResponse } from 'next/server';
import { UpdateSoutenanceNoteUseCase } from '@/application/use-cases/index';
import { MySQLSoutenanceNoteRepository } from '@/infrastructure/repositories/index';
import { withAuth, AuthenticatedRequest } from '@/infrastructure/middleware/authMiddleware';

const soutenanceNoteRepository = new MySQLSoutenanceNoteRepository();
const updateSoutenanceNoteUseCase = new UpdateSoutenanceNoteUseCase(soutenanceNoteRepository);

// POST: Teachers can only add/edit notes for their own soutenances
async function postHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const { soutenance_part_id, teacher_id, note_text } = body;
        const currentTeacher = request.teacher!;

        if (!soutenance_part_id || !note_text) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Teachers can only add notes to their own soutenances
        // Use current teacher's ID instead of the one in the request
        const result = await updateSoutenanceNoteUseCase.execute({
            soutenance_part_id: parseInt(soutenance_part_id),
            teacher_id: currentTeacher.id,
            note_text
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating soutenance note:', error);
        return NextResponse.json(
            { error: 'Failed to update soutenance note' },
            { status: 500 }
        );
    }
}

// DELETE: Teachers can only delete their own notes
async function deleteHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const { soutenance_part_id } = body;
        const currentTeacher = request.teacher!;

        if (!soutenance_part_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Teachers can only delete their own notes
        const result = await updateSoutenanceNoteUseCase.deleteNote(
            parseInt(soutenance_part_id),
            currentTeacher.id
        );

        if (result) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error deleting soutenance note:', error);
        return NextResponse.json(
            { error: 'Failed to delete soutenance note' },
            { status: 500 }
        );
    }
}

export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler);
