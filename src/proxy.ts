import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');
    
    // Read the password dynamically from environment variables, fallback to 'tfkstore2026'
    const adminPassword = process.env.ADMIN_PASSWORD || 'tfkstore2026';
    const expectedAuth = 'Basic ' + Buffer.from(`admin:${adminPassword}`).toString('base64');
    
    if (!authHeader || authHeader !== expectedAuth) {
      return new NextResponse('Authentification requise', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Accès Admin sécurisé"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
