import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('Authentication')?.value;

  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Επαλήθευση του token μέσω του /api/auth/verify
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      headers: {
        Cookie: `Authentication=${token}`,
      },
    });
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware verify error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};