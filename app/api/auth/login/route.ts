import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";
import { getTenantRaw } from "@/lib/tenant";

// In-memory rate limiting: Map<slug+ip, { count, resetAt }>
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(slug: string, ip: string) {
  return `${slug}::${ip}`;
}

function isRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(key: string) {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    entry.count++;
  }
}

function resetAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  // Artificial delay to mitigate timing attacks
  await new Promise((r) => setTimeout(r, 500));

  const slug = request.headers.get("x-tenant");
  if (!slug) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimitKey = getRateLimitKey(slug, ip);

  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const tenant = await getTenantRaw(slug);
  if (!tenant?.auth || !tenant.auth.passwordHash) {
    recordAttempt(rateLimitKey);
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const emailMatch = tenant.auth.email === email;
  const passwordMatch = emailMatch
    ? await verifyPassword(password, tenant.auth.passwordHash)
    : false;

  if (!emailMatch || !passwordMatch) {
    recordAttempt(rateLimitKey);
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  resetAttempts(rateLimitKey);

  const token = await createToken(slug);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });

  return response;
}
