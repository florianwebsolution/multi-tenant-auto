import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function isNgrokHost(host: string): boolean {
  return host.includes("ngrok.io") || host.includes("ngrok-free.app");
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Bypass tenant detection for ngrok tunnels (used for Make/webhook testing)
  if (isNgrokHost(host)) {
    return NextResponse.next();
  }

  const parts = host.split(".");

  // Determine tenant slug from subdomain
  const slug = parts.length > 1 ? parts[0] : null;

  const { pathname } = request.nextUrl;
  const isBackoffice = pathname.startsWith("/backoffice");
  const isPublicBackofficePage =
    pathname === "/backoffice/login" ||
    pathname === "/backoffice/setup-password";

  // Pass slug to pages via header
  const requestHeaders = new Headers(request.headers);
  if (slug) {
    requestHeaders.set("x-tenant", slug);
  }

  // Only protect backoffice routes
  if (!isBackoffice) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public backoffice pages (login, setup-password): pass through, redirect if already authenticated
  const token = request.cookies.get("auth-token")?.value;

  if (isPublicBackofficePage) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.slug === slug) {
        return NextResponse.redirect(new URL("/backoffice", request.url));
      }
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // All other /backoffice/* routes: require valid token matching current tenant
  if (!token) {
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload || payload.slug !== slug) {
    const response = NextResponse.redirect(
      new URL("/backoffice/login", request.url)
    );
    response.cookies.delete("auth-token");
    return response;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
