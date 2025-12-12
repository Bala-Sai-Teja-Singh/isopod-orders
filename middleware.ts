// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api/orders')) {
    // For API routes, you could add additional verification
    // For now, we're relying on the frontend check
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
