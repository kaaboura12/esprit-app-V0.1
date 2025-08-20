import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/infrastructure/middleware/authMiddleware';

async function getHandler(request: AuthenticatedRequest) {
    try {
        const teacher = request.teacher!;
        
        return NextResponse.json({
            id: teacher.id,
            email: teacher.email,
            role: teacher.role
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        return NextResponse.json(
            { error: 'Failed to get user info' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(getHandler);
