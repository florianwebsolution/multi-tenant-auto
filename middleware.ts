import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ROOT_DOMAIN = "cherubif.fr";

function isRootDomain(host: string): boolean {
  // cherubif.fr or www.cherubif.fr — no tenant subdomain
  return host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`;
}

function extractSlug(host: string): string | null {
  // Strip port if present (e.g. localhost:3000)
  const hostWithoutPort = host.split(":")[0];
  const parts = hostWithoutPort.split(".");

  // *.cherubif.fr → subdomain is the slug
  if (hostWithoutPort.endsWith(ROOT_DOMAIN)) {
    const sub = parts.slice(0, parts.length - ROOT_DOMAIN.split(".").length).join(".");
    return sub || null;
  }

  // localhost dev: slug.localhost
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    return parts[0];
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Root domain — no tenant, pass through (landing page, webhook, etc.)
  if (isRootDomain(host)) {
    return NextResponse.next();
  }

  const slug = extractSlug(host);

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
