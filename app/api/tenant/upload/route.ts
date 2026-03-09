import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/lib/auth";

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
  }

  // Sanitise filename: keep extension, replace everything else
  const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || "";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", slug);
  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await fs.writeFile(path.join(uploadDir, safeName), Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    filename: safeName,
    url: `/uploads/${slug}/${safeName}`,
  });
}
