import { NextRequest, NextResponse } from 'next/server';
import { CreateSoutenanceUseCase, GetSoutenanceUseCase } from '@/application/use-cases/index';
import { MySQLSoutenanceRepository, MySQLSoutenancePartRepository, MySQLSoutenanceNoteRepository } from '@/infrastructure/repositories/index';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/infrastructure/middleware/authMiddleware';

const soutenanceRepository = new MySQLSoutenanceRepository();
const soutenancePartRepository = new MySQLSoutenancePartRepository();
const soutenanceNoteRepository = new MySQLSoutenanceNoteRepository();

const createSoutenanceUseCase = new CreateSoutenanceUseCase(soutenanceRepository);
const getSoutenanceUseCase = new GetSoutenanceUseCase(soutenanceRepository, soutenancePartRepository, soutenanceNoteRepository);

// GET: Teachers see only their soutenances, Admins see all
async function getHandler(request: AuthenticatedRequest) {
    try {
        const teacher = request.teacher!;
        
        let soutenances;
        if (teacher.role === 'admin') {
            // Admins can see all soutenances
            soutenances = await getSoutenanceUseCase.getAll();
        } else {
            // Teachers can only see their own soutenances
            soutenances = await getSoutenanceUseCase.getByTeacherId(teacher.id);
        }
        
        return NextResponse.json(soutenances);
    } catch (error) {
        console.error('Error fetching soutenances:', error);
        return NextResponse.json(
            { error: 'Failed to fetch soutenances' },
            { status: 500 }
        );
    }
}

// POST: Teachers and admins can create soutenances
async function postHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const { etudiant_id, teacher_id, date_soutenance, sujet } = body;
        const currentTeacher = request.teacher!;

        if (!etudiant_id || !date_soutenance) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Teachers can only create soutenances for themselves
        // Admins can create soutenances for any teacher
        const finalTeacherId = currentTeacher.role === 'admin' ? 
            parseInt(teacher_id) : currentTeacher.id;

        const result = await createSoutenanceUseCase.execute({
            etudiant_id: parseInt(etudiant_id),
            teacher_id: finalTeacherId,
            date_soutenance: new Date(date_soutenance),
            sujet
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating soutenance:', error);
        return NextResponse.json(
            { error: 'Failed to create soutenance' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
