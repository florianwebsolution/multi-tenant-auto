import { promises as fs } from "fs";
import path from "path";

// ── Sub-types ────────────────────────────────────────────────────────────────

export interface TenantHoraire {
  jour: string;
  heures: string;
}

export interface TenantEquipeMembre {
  nom: string;
  role: string;
  photo: string;
}

export interface TenantTemoignage {
  nom: string;
  note: number;
  texte: string;
  date: string;
}

export interface TenantAgence {
  id: string;
  ville: string;
  address: string;
  phone: string;
  email: string;
  horaires: TenantHoraire[];
  coordonnees: { lat: number; lng: number };
  description: string;
  images: string[];
  equipe: TenantEquipeMembre[];
  galerie: string[];
  avis: {
    vroomvroom: { enabled: boolean; url: string };
    temoignages: TenantTemoignage[];
    tauxSatisfaction: number;
  };
}

export interface TenantFormation {
  id: string;
  nom: string;
  icon: string;
  description: string;
  details: string;
  tarifs: Array<{ label: string; prix: number }>;
  enAvant: boolean;
}

export interface TenantFinancement {
  id: string;
  nom: string;
  logo: string;
  description: string;
  lien: string;
}

export interface TenantLabel {
  id: string;
  nom: string;
  logo: string;
  description: string;
  documents?: Array<{ nom: string; fichier: string }>;
  nda?: string;
}

export interface TenantAtout {
  id: string;
  titre: string;
  description: string;
  icon: string;
}

// ── Main interface ───────────────────────────────────────────────────────────

export interface TenantData {
  // Core fields (used by backoffice)
  name: string;
  address: string;
  phone: string;
  email?: string;

  // Template config
  slug?: string;
  template?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };

  // Sections
  banner?: {
    enabled: boolean;
    message: string;
    modal: {
      enabled: boolean;
      title: string;
      content: string;
    };
  };

  header?: {
    logo?: string;
    name?: string;
    phone?: string;
    address?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
    };
    menu?: Array<{ label: string; anchor: string }>;
  };

  agences?: TenantAgence[];
  formations?: TenantFormation[];

  prepacode?: {
    enabled: boolean;
    description: string;
    url: string;
  };

  paiements?: string[];
  financements?: TenantFinancement[];
  labels?: TenantLabel[];
  atouts?: TenantAtout[];

  contact?: {
    formulaire: boolean;
    rdv: { enabled: boolean; url: string };
  };

  footer?: {
    agrement: string;
    mentionsLegales: string;
    politiqueConfidentialite: string;
    autresAgences: Array<{ nom: string; url: string }>;
  };
}

export interface TenantAuth {
  email: string;
  passwordHash: string | null;
  setupToken: string | null;
  setupTokenExpiry: string | null;
}

interface TenantRaw extends TenantData {
  auth?: TenantAuth;
}

function readTenantFile(slug: string) {
  const filePath = path.join(process.cwd(), "tenants", slug, "data.json");
  return fs.readFile(filePath, "utf-8");
}

function tenantFilePath(slug: string) {
  return path.join(process.cwd(), "tenants", slug, "data.json");
}

/** Returns tenant data WITHOUT the auth field (safe for client/API responses) */
export async function getTenant(slug: string): Promise<TenantData | null> {
  try {
    const raw = await readTenantFile(slug);
    const { auth: _auth, ...data } = JSON.parse(raw) as TenantRaw;
    return data;
  } catch {
    return null;
  }
}

/** Returns full tenant data INCLUDING auth (server-side only) */
export async function getTenantRaw(slug: string): Promise<TenantRaw | null> {
  try {
    const raw = await readTenantFile(slug);
    return JSON.parse(raw) as TenantRaw;
  } catch {
    return null;
  }
}

/** Writes allowed fields back to data.json, preserving auth and other fields */
export async function updateTenant(
  slug: string,
  fields: Partial<Pick<TenantData, "name" | "address" | "phone" | "email">>
): Promise<TenantData | null> {
  try {
    const raw = await readTenantFile(slug);
    const existing = JSON.parse(raw) as TenantRaw;
    const updated: TenantRaw = { ...existing, ...fields };
    await fs.writeFile(tenantFilePath(slug), JSON.stringify(updated, null, 2), "utf-8");
    const { auth: _auth, ...data } = updated;
    return data;
  } catch {
    return null;
  }
}

// ── Deep merge helper (replaces arrays, merges plain objects) ────────────────

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>
      );
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

/** Deep-merges an arbitrary patch into data.json (auth and slug are protected) */
export async function updateTenantData(
  slug: string,
  patch: Record<string, unknown>
): Promise<TenantData | null> {
  try {
    const raw = await readTenantFile(slug);
    const existing = JSON.parse(raw) as TenantRaw;
    const merged = deepMerge(
      existing as unknown as Record<string, unknown>,
      patch
    ) as unknown as TenantRaw;
    await fs.writeFile(tenantFilePath(slug), JSON.stringify(merged, null, 2), "utf-8");
    const { auth: _auth, ...data } = merged;
    return data as TenantData;
  } catch {
    return null;
  }
}

/** Writes updated auth fields to data.json (server-side only) */
export async function updateTenantAuth(
  slug: string,
  auth: TenantAuth
): Promise<void> {
  const raw = await readTenantFile(slug);
  const existing = JSON.parse(raw) as TenantRaw;
  const updated: TenantRaw = { ...existing, auth };
  await fs.writeFile(tenantFilePath(slug), JSON.stringify(updated, null, 2), "utf-8");
}
