import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // In GitHub Codespaces, requests come through a forwarded proxy.
  // Next.js Server Actions validate that the origin matches x-forwarded-host.
  // If accessing via localhost but forwarded through Codespaces domain, we need to fix this.
  
  const xForwardedHost = request.headers.get("x-forwarded-host");
  const origin = request.headers.get("origin");
  
  // If we're in development and have both headers, make sure they match
  if (process.env.NODE_ENV === "development" && xForwardedHost && origin) {
    const requestHeaders = new Headers(request.headers);
    
    // Use the forwarded host as the canonical origin for Server Actions
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const newOrigin = `${forwardedProto}://${xForwardedHost}`;
    
    if (origin !== newOrigin) {
      requestHeaders.set("origin", newOrigin);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

