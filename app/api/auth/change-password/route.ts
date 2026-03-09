import { NextRequest, NextResponse } from "next/server";
import { verifyToken, verifyPassword, hashPassword } from "@/lib/auth";
import { getTenantRaw, updateTenantAuth } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  // 1. Verify JWT from cookie
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  // 2. Verify token slug matches current tenant (anti cross-tenant)
  const slug = request.headers.get("x-tenant");
  if (!slug || payload.slug !== slug) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  // 3. Parse body
  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Les champs currentPassword et newPassword sont obligatoires." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit faire au moins 8 caractères." },
      { status: 400 }
    );
  }

  // 4. Load tenant with auth field
  const tenant = await getTenantRaw(slug);
  if (!tenant?.auth?.passwordHash) {
    return NextResponse.json({ error: "Tenant introuvable." }, { status: 404 });
  }

  // 5. Verify current password
  const valid = await verifyPassword(currentPassword, tenant.auth.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Le mot de passe actuel est incorrect." },
      { status: 401 }
    );
  }

  // 6. Hash new password and update data.json
  const newHash = await hashPassword(newPassword);
  await updateTenantAuth(slug, {
    email: tenant.auth.email,
    passwordHash: newHash,
    setupToken: null,
    setupTokenExpiry: null,
  });

  return NextResponse.json({ ok: true });
}
