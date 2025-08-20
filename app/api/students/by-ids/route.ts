import { NextRequest, NextResponse } from 'next/server';
import { MySQLStudentRepository } from '@/infrastructure/repositories/MySQLStudentRepository';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentIds } = body;

        if (!Array.isArray(studentIds)) {
            return NextResponse.json(
                { error: 'studentIds must be an array' },
                { status: 400 }
            );
        }

        const studentRepository = new MySQLStudentRepository();
        const students = await studentRepository.findByIds(studentIds);

        const studentDTOs = students.map(student => ({
            id: student.getId(),
            nom: student.getLastname(),
            prenom: student.getFirstname(),
            email: student.getEmailValue(),
            numeroEtudiant: student.getNumeroEtudiantValue()
        }));

        return NextResponse.json(studentDTOs);
    } catch (error) {
        console.error('Error fetching students by IDs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
