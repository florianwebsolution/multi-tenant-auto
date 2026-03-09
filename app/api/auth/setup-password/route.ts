import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getTenantRaw, updateTenantAuth } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const slug = request.headers.get("x-tenant");
  if (!slug) {
    return NextResponse.json({ error: "Tenant introuvable." }, { status: 400 });
  }

  let body: { token?: string; password?: string; confirmPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { token, password, confirmPassword } = body;

  if (!token || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Les champs token, password et confirmPassword sont obligatoires." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit faire au moins 8 caractères." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Les deux mots de passe ne correspondent pas." },
      { status: 400 }
    );
  }

  const tenant = await getTenantRaw(slug);
  if (!tenant?.auth) {
    return NextResponse.json({ error: "Tenant introuvable." }, { status: 404 });
  }

  const { auth } = tenant;

  // Password already set → token already consumed
  if (auth.passwordHash !== null) {
    return NextResponse.json(
      { error: "Ce lien a déjà été utilisé. Connectez-vous normalement.", redirect: true },
      { status: 409 }
    );
  }

  // Token mismatch
  if (auth.setupToken !== token) {
    return NextResponse.json(
      { error: "Lien invalide ou déjà utilisé." },
      { status: 400 }
    );
  }

  // Token expired
  if (!auth.setupTokenExpiry || new Date(auth.setupTokenExpiry) < new Date()) {
    return NextResponse.json(
      { error: "Ce lien a expiré. Contactez l'administrateur pour en obtenir un nouveau." },
      { status: 400 }
    );
  }

  // All good — hash password and consume token
  const passwordHash = await hashPassword(password);
  await updateTenantAuth(slug, {
    email: auth.email,
    passwordHash,
    setupToken: null,
    setupTokenExpiry: null,
  });

  return NextResponse.json({ ok: true });
}
