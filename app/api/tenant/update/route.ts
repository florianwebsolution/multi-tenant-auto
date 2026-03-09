import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { updateTenantData } from "@/lib/tenant";

// Fields that must never be overwritten via this route
const PROTECTED_KEYS = new Set(["auth", "slug"]);

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const slug = request.headers.get("x-tenant");
  if (!slug || payload.slug !== slug) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Strip protected fields — auth and slug are never touched here
  for (const key of PROTECTED_KEYS) {
    delete body[key];
  }

  const updated = await updateTenantData(slug, body);
  if (!updated) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
