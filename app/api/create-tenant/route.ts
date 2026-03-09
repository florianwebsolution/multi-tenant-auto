import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlainObject = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Deep merge (plain objects only — arrays replaced wholesale)
// ---------------------------------------------------------------------------

function deepMerge(target: PlainObject, source: PlainObject): PlainObject {
  const result: PlainObject = { ...target };
  for (const key of Object.keys(source)) {
    const src = source[key];
    const tgt = result[key];
    if (
      src !== null &&
      typeof src === "object" &&
      !Array.isArray(src) &&
      tgt !== null &&
      typeof tgt === "object" &&
      !Array.isArray(tgt)
    ) {
      result[key] = deepMerge(tgt as PlainObject, src as PlainObject);
    } else {
      result[key] = src;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

const ACCENT_MAP: Record<string, string> = {
  à: "a", â: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  î: "i", ï: "i",
  ô: "o", ö: "o",
  ù: "u", û: "u", ü: "u",
  ÿ: "y",
  ç: "c",
  ñ: "n",
  æ: "ae", œ: "oe",
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àâäéèêëîïôöùûüÿçñæœ]/g, (c) => ACCENT_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  const tenantsDir = path.join(process.cwd(), "tenants");
  let candidate = base;
  let i = 2;
  while (true) {
    try {
      await fs.access(path.join(tenantsDir, candidate));
      candidate = `${base}-${i++}`;
    } catch {
      return candidate;
    }
  }
}

// ---------------------------------------------------------------------------
// Formations catalogue
// ---------------------------------------------------------------------------

const FORMATIONS_CATALOGUE: Record<string, PlainObject> = {
  "permis-b": {
    id: "permis-b",
    nom: "Permis B",
    icon: "car",
    description: "Le permis B classique pour conduire une voiture.",
    details: "Formation complète incluant le code de la route et la conduite accompagnée ou traditionnelle.",
    tarifs: [],
    enAvant: true,
  },
  "permis-b-aac": {
    id: "permis-b-aac",
    nom: "Permis B (AAC)",
    icon: "car",
    description: "Apprentissage Anticipé de la Conduite dès 15 ans.",
    details: "Formule recommandée pour les jeunes conducteurs. Réduit la sinistralité et baisse le malus.",
    tarifs: [],
    enAvant: true,
  },
  "permis-a2": {
    id: "permis-a2",
    nom: "Permis A2",
    icon: "bike",
    description: "Permis moto intermédiaire pour motos jusqu'à 35 kW.",
    details: "Accès possible dès 18 ans. Passerelle vers le permis A après 2 ans.",
    tarifs: [],
    enAvant: true,
  },
  "permis-a": {
    id: "permis-a",
    nom: "Permis A",
    icon: "bike",
    description: "Permis moto toutes cylindrées.",
    details: "Accessible à 24 ans ou par passerelle A2. Formation progressive pour maîtriser les grosses cylindrées.",
    tarifs: [],
    enAvant: false,
  },
  "permis-am": {
    id: "permis-am",
    nom: "Permis AM (BSR)",
    icon: "zap",
    description: "Brevet de Sécurité Routière pour cyclomoteurs.",
    details: "Obligatoire depuis 2013 pour conduire un 50 cm³. Formation en une journée.",
    tarifs: [],
    enAvant: false,
  },
  "permis-b96": {
    id: "permis-b96",
    nom: "Permis B96",
    icon: "truck",
    description: "Extension du permis B pour remorques de 750 à 3 500 kg.",
    details: "Formation courte de 7 heures permettant de tracter des remorques lourdes sans passer le permis BE.",
    tarifs: [],
    enAvant: false,
  },
};

// ---------------------------------------------------------------------------
// Static catalogues
// ---------------------------------------------------------------------------

const STATIC_FINANCEMENTS: PlainObject[] = [
  {
    id: "cpf",
    nom: "CPF",
    logo: "",
    description: "Utilisez vos droits CPF (Compte Personnel de Formation) pour financer tout ou partie de votre permis.",
    url: "",
  },
  {
    id: "permis-1ej",
    nom: "Permis à 1€/jour",
    logo: "",
    description: "Dispositif d'aide à l'accès au permis de conduire pour les jeunes de 15 à 25 ans.",
    url: "",
  },
  {
    id: "france-travail",
    nom: "France Travail",
    logo: "",
    description: "Des aides spécifiques pour les demandeurs d'emploi souhaitant obtenir le permis.",
    url: "",
  },
];

const STATIC_LABELS: PlainObject[] = [
  {
    id: "qualite-autoecole",
    nom: "Qualité Auto-École",
    logo: "",
    description: "Certification nationale garantissant la qualité de notre enseignement et de notre infrastructure.",
    nda: "",
    documents: [],
  },
  {
    id: "qualiopi",
    nom: "Qualiopi",
    logo: "",
    description: "Certification qualité des prestataires de formation professionnelle.",
    nda: "",
    documents: [],
  },
];

const STATIC_ATOUTS: PlainObject[] = [
  {
    id: "atout-1",
    titre: "Moniteurs diplômés",
    description: "Tous nos moniteurs sont titulaires du BEPECASER ou du Titre Pro ECSR.",
    icon: "shield",
  },
  {
    id: "atout-2",
    titre: "Véhicules récents",
    description: "Notre flotte est renouvelée régulièrement pour votre confort et sécurité.",
    icon: "car",
  },
  {
    id: "atout-3",
    titre: "Taux de réussite élevé",
    description: "Plus de 80 % de nos élèves obtiennent leur permis du premier coup.",
    icon: "trophy",
  },
  {
    id: "atout-4",
    titre: "Suivi personnalisé",
    description: "Un bilan de conduite à chaque étape pour progresser à votre rythme.",
    icon: "users",
  },
  {
    id: "atout-5",
    titre: "Code en ligne 24h/24",
    description: "Accès illimité à notre plateforme de code en ligne depuis n'importe quel appareil.",
    icon: "clock",
  },
  {
    id: "atout-6",
    titre: "Financement facilité",
    description: "CPF, permis à 1€/jour, France Travail — nous vous accompagnons dans vos démarches.",
    icon: "credit-card",
  },
];

// ---------------------------------------------------------------------------
// Legal text generators
// ---------------------------------------------------------------------------

function generateMentionsLegales(name: string, address: string, email: string): string {
  return `Éditeur du site : ${name}, ${address}. Email : ${email}.

Le présent site est édité par ${name}, auto-école agréée par la préfecture. Toute reproduction ou représentation, totale ou partielle, du site ou de son contenu, est interdite sans l'autorisation expresse de ${name}.

Les informations figurant sur ce site sont données à titre indicatif. ${name} se réserve le droit de les modifier sans préavis.

Hébergement : Vercel Inc., 340 Pine Street, Suite 603, San Francisco, California 94104, États-Unis.`;
}

function generatePolitiqueConfidentialite(name: string, email: string): string {
  return `${name} s'engage à protéger votre vie privée. Les données collectées via le formulaire de contact (nom, email, message) sont utilisées uniquement pour répondre à votre demande.

Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à : ${email}.

Aucune donnée personnelle n'est cédée à des tiers sans votre consentement préalable. Les données sont conservées pendant une durée maximale de 3 ans.`;
}

// ---------------------------------------------------------------------------
// Default template builder
// ---------------------------------------------------------------------------

function buildDefaultTemplate(
  name: string,
  address: string,
  phone: string,
  email: string
): PlainObject {
  return {
    banner: {
      enabled: false,
      message: "",
      modal: { enabled: false, title: "", content: "" },
    },
    header: {
      logo: "",
      name,
      phone,
      address,
      socialLinks: { facebook: "", instagram: "", tiktok: "" },
      menu: [
        { label: "Formations", anchor: "formations" },
        { label: "Agence", anchor: "agence" },
        { label: "Financements", anchor: "financements" },
        { label: "Atouts", anchor: "atouts" },
        { label: "Contact", anchor: "contact" },
      ],
    },
    agences: [],
    formations: [],
    prepacode: {
      enabled: false,
      description: "Préparez votre code de la route en ligne, à votre rythme, 24h/24 et 7j/7.",
      url: "",
    },
    paiements: [],
    financements: STATIC_FINANCEMENTS,
    labels: STATIC_LABELS,
    atouts: STATIC_ATOUTS,
    contact: {
      formulaire: true,
      rdv: { enabled: false, url: "" },
    },
    footer: {
      agrement: "",
      mentionsLegales: generateMentionsLegales(name, address, email),
      politiqueConfidentialite: generatePolitiqueConfidentialite(name, email),
    },
  };
}

// ---------------------------------------------------------------------------
// Gravity Forms label → catalogue slug mapping
// ---------------------------------------------------------------------------

// Covers all keys in FORMATIONS_CATALOGUE + common GF short labels
const GF_LABEL_TO_SLUG: Record<string, string> = {
  // Permis B
  "B":           "permis-b",
  "Permis B":    "permis-b",
  // Permis B AAC / BEA
  "BEA":         "permis-b-aac",
  "AAC":         "permis-b-aac",
  "Permis B AAC": "permis-b-aac",
  "Permis B (AAC)": "permis-b-aac",
  // Permis A2
  "A2":          "permis-a2",
  "Permis A2":   "permis-a2",
  // Permis A
  "A":           "permis-a",
  "Permis A":    "permis-a",
  // Permis A1
  "A1":          "permis-a2", // A1 mapped to a2 (closest catalogue entry)
  // Permis AM / BSR
  "AM":          "permis-am",
  "BSR":         "permis-am",
  "Permis AM":   "permis-am",
  "Permis AM (BSR)": "permis-am",
  // Permis B96
  "B96":         "permis-b96",
  "Permis B96":  "permis-b96",
};

/**
 * Normalise any raw formations value into an array of catalogue slugs.
 * Accepts:
 *   - Gravity Forms object: { "55.1": "B", "55.2": "BEA", "55.3": "" }
 *   - Plain array of labels or slugs: ["B", "permis-a2"]
 *   - A single string (edge case)
 * Filters empty values, maps via GF_LABEL_TO_SLUG (falls back to the raw
 * value itself so direct slug calls keep working), and deduplicates.
 */
function normalizeFormations(raw: unknown): string[] {
  let values: string[] = [];

  if (Array.isArray(raw)) {
    values = raw.filter((v): v is string => typeof v === "string");
  } else if (raw !== null && typeof raw === "object") {
    values = Object.values(raw as Record<string, unknown>).filter(
      (v): v is string => typeof v === "string"
    );
  } else if (typeof raw === "string") {
    values = [raw];
  }

  const slugs = values
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map((v) => GF_LABEL_TO_SLUG[v] ?? v); // fallback keeps the value as-is (direct slug call)

  // Deduplicate while preserving order
  return [...new Set(slugs)];
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const VALID_TEMPLATES = ["moderne", "classique"];

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. API key authentication
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.CREATE_TENANT_API_KEY;
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: "Clé API invalide ou manquante." },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: PlainObject;
  try {
    body = await request.json();
  } catch {
    return err("Corps de requête JSON invalide.");
  }

  // 3. Validate required fields
  const required = ["name", "email", "phone", "address", "adminEmail"] as const;
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string") {
      return err(`Le champ "${field}" est obligatoire.`);
    }
  }

  const name       = (body.name       as string).trim();
  const email      = (body.email      as string).trim();
  const phone      = (body.phone      as string).trim();
  const address    = (body.address    as string).trim();
  const adminEmail = (body.adminEmail as string).trim();
  const template   = typeof body.template === "string" ? body.template.trim() : "moderne";

  // 4. Validate template
  if (!VALID_TEMPLATES.includes(template)) {
    return err(`Template invalide. Valeurs acceptées : ${VALID_TEMPLATES.join(", ")}.`);
  }

  // 5. Validate colors
  const colorsRaw = body.colors as { primary?: string; secondary?: string } | undefined;
  const primary   = colorsRaw?.primary?.trim()   ?? "#3b82f6";
  const secondary = colorsRaw?.secondary?.trim() ?? "#1a1a2e";

  if (!HEX_COLOR.test(primary)) {
    return err("colors.primary doit être un code hexadécimal valide (ex: #e63946).");
  }
  if (!HEX_COLOR.test(secondary)) {
    return err("colors.secondary doit être un code hexadécimal valide (ex: #1a1a2e).");
  }

  // 6. Normalize and map formations → catalogue objects
  // Merges all formation fields (voiture, moto, remorque, poids lourd, bateau)
  // Each field accepts a GF object, an array of labels, or an array of slugs.
  const rawFormationSlugs = [
    ...normalizeFormations(body.formations),
    ...normalizeFormations(body.formationsMoto),
    ...normalizeFormations(body.formationsRemorque),
    ...normalizeFormations(body.formationsPoidLourd),
    ...normalizeFormations(body.formationsBateau),
  ];
  // Deduplicate across all sources
  const allFormationSlugs = [...new Set(rawFormationSlugs)];

  const formations: PlainObject[] = [];
  for (const id of allFormationSlugs) {
    const found = FORMATIONS_CATALOGUE[id];
    if (!found) {
      return err(
        `ID de formation inconnu : "${id}". Valeurs acceptées : ${Object.keys(FORMATIONS_CATALOGUE).join(", ")}.`
      );
    }
    formations.push(found);
  }

  // 7. Validate paiements (array of strings)
  const paiements: string[] = [];
  if (Array.isArray(body.paiements)) {
    for (const p of body.paiements as unknown[]) {
      if (typeof p !== "string") {
        return err(`Chaque élément de "paiements" doit être une chaîne.`);
      }
      paiements.push(p.trim());
    }
  }

  // 8. Build patch from optional body fields (only known keys)
  const patch: PlainObject = {};

  if (typeof body.banner === "object" && body.banner !== null && !Array.isArray(body.banner)) {
    patch.banner = body.banner as PlainObject;
  }
  if (Array.isArray(body.agences)) {
    patch.agences = body.agences;
  }
  if (formations.length > 0) {
    patch.formations = formations;
  }
  if (paiements.length > 0) {
    patch.paiements = paiements;
  }
  if (typeof body.prepacode === "object" && body.prepacode !== null && !Array.isArray(body.prepacode)) {
    patch.prepacode = body.prepacode as PlainObject;
  }
  if (typeof body.contact === "object" && body.contact !== null && !Array.isArray(body.contact)) {
    patch.contact = body.contact as PlainObject;
  }
  // Allow overriding socialLinks from header (menu is always static)
  if (typeof body.header === "object" && body.header !== null && !Array.isArray(body.header)) {
    const headerRaw = body.header as PlainObject;
    if (typeof headerRaw.socialLinks === "object" && headerRaw.socialLinks !== null) {
      patch.header = { socialLinks: headerRaw.socialLinks as PlainObject };
    }
  }
  // Allow overriding footer.agrement only (legal texts are auto-generated)
  if (typeof body.footer === "object" && body.footer !== null && !Array.isArray(body.footer)) {
    const footerRaw = body.footer as PlainObject;
    if (typeof footerRaw.agrement === "string") {
      patch.footer = { agrement: footerRaw.agrement };
    }
  }

  // 9. Generate unique slug
  const slug = await uniqueSlug(toSlug(name));

  // 10. Generate setup token (one-time, expires in 24h)
  const setupToken       = crypto.randomUUID();
  const setupTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // 11. Build final data: default ← patch, then stamp identity + auth
  const defaults = buildDefaultTemplate(name, address, phone, email);
  const merged   = deepMerge(defaults, patch);

  const data: PlainObject = {
    slug,
    name,
    address,
    phone,
    email,
    template,
    colors: { primary, secondary },
    ...merged,
    // Auth is always server-generated — never accepted from body
    auth: {
      email: adminEmail,
      passwordHash: null,
      setupToken,
      setupTokenExpiry,
    },
  };

  // 12. Create tenant directory structure
  const tenantDir  = path.join(process.cwd(), "tenants", slug);
  const uploadsDir = path.join(tenantDir, "uploads");

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {
    return err("Erreur lors de la création du dossier tenant.", 500);
  }

  // 13. Write data.json
  try {
    await fs.writeFile(
      path.join(tenantDir, "data.json"),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch {
    return err("Erreur lors de l'écriture du fichier de configuration.", 500);
  }

  // 14. Return success with setup URL
  const base = `http://${slug}.localhost:3000`;
  return NextResponse.json(
    {
      success: true,
      slug,
      url: base,
      backoffice: `${base}/backoffice`,
      setupUrl: `${base}/backoffice/setup-password?token=${setupToken}`,
    },
    { status: 201 }
  );
}
