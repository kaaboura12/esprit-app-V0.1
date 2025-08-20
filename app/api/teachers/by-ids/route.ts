import { NextRequest, NextResponse } from 'next/server';
import { MySQLTeacherRepository } from '@/infrastructure/repositories/MySQLTeacherRepository';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teacherIds } = body;

        if (!Array.isArray(teacherIds)) {
            return NextResponse.json(
                { error: 'teacherIds must be an array' },
                { status: 400 }
            );
        }

        const teacherRepository = new MySQLTeacherRepository();
        const teachers = await teacherRepository.findByIds(teacherIds);

        const teacherDTOs = teachers.map(teacher => ({
            id: teacher.getId(),
            nom: teacher.getLastname(),
            prenom: teacher.getFirstname(),
            email: teacher.getEmailValue(),
            departement: teacher.getDepartement()
        }));

        return NextResponse.json(teacherDTOs);
    } catch (error) {
        console.error('Error fetching teachers by IDs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teachers' },
            { status: 500 }
        );
    }
}
