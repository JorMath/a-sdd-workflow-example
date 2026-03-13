import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { hasRole, type UserRole } from '@/lib/auth/permissions';

type Role = 'super_admin' | 'admin_torneo' | 'arbitro' | 'capitan' | 'jugador';

interface AuthRequest extends NextRequest {
  auth: Session | null;
}

const routeRoleMap: Record<string, Role[]> = {
  '/admin': ['super_admin', 'admin_torneo'],
  '/referee': ['arbitro'],
  '/capitan': ['capitan'],
  '/perfil': ['jugador', 'capitan', 'arbitro', 'admin_torneo', 'super_admin'],
};

function getRequiredRoles(pathname: string): Role[] | null {
  for (const [route, roles] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export default auth((req: AuthRequest) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const requiredRoles = getRequiredRoles(pathname);

  if (!requiredRoles) {
    if (!isLoggedIn && pathname.startsWith('/(dashboard)')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = req.auth?.user?.role as UserRole | undefined;

  if (!userRole) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const hasAccess = requiredRoles.some((role) => hasRole(userRole, role));

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
