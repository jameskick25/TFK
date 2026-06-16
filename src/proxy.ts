import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Uniquement pour les routes /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');
    
    // Le mot de passe par défaut est 'ammode2026' (tu pourras le changer plus tard)
    // base64 de admin:ammode2026 -> YWRtaW46YW1tb2RlMjAyNg==
    if (!authHeader || authHeader !== 'Basic YWRtaW46YW1tb2RlMjAyNg==') {
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
