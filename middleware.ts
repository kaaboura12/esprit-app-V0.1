import { NextRequest, NextResponse } from 'next/server';
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton';
import { ValidateTokenUseCase } from '@/application/use-cases/ValidateTokenUseCase';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/validate', '/api/health', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for an auth_token in cookies
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token using ValidateTokenUseCase
  const tokenService = JwtTokenServiceSingleton.getInstance();
  const validateTokenUseCase = new ValidateTokenUseCase(tokenService);
  const result = await validateTokenUseCase.execute(token);

  if (!result.valid || !result.authToken) {
    // Invalid or expired token
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all routes except:
    // - /login
    // - /api/auth/*
    // - /_next/static/*
    // - /_next/image/*
    // - /favicon.ico
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 