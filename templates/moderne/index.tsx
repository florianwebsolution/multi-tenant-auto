"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  TenantData,
  TenantAgence,
  TenantFormation,
} from "@/lib/tenant";
import {
  Phone, Mail, MapPin, Clock, Calendar,
  Facebook, Instagram, Video, Youtube, Linkedin, Share2,
  Info, Menu, X,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Check, Download, ExternalLink,
  Star, CreditCard, Banknote, Wallet,
  GraduationCap, Gauge, Target, Globe,
  Car, Users, Shield, Award, Bike, Truck, Zap, Heart, Leaf, Home,
} from "lucide-react";

// ── Utility ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  car: Car, users: Users, shield: Shield, award: Award,
  bike: Bike, truck: Truck, zap: Zap, heart: Heart,
  leaf: Leaf, globe: Globe, home: Home, target: Target,
  gauge: Gauge, phone: Phone, mail: Mail, "map-pin": MapPin,
  "graduation-cap": GraduationCap, "credit-card": CreditCard,
};

function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name] ?? Car;
  return <Icon className={className} style={style} />;
}

function isAgenceOpen(horaires: TenantAgence["horaires"]): boolean {
  const now = new Date();
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const todayName = dayNames[now.getDay()];
  const horaire = horaires.find((h) => h.jour === todayName);
  if (!horaire || horaire.heures === "Fermé") return false;
  const m = horaire.heures.match(/(\d+)h(\d+)\s*-\s*(\d+)h(\d+)/);
  if (!m) return false;
  const [, oh, om, ch, cm] = m.map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

function getTodayName(): string {
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return dayNames[new Date().getDay()];
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ── Shared micro-components ───────────────────────────────────────────────────

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= note ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#1a1a2e]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── 1. BANNER ─────────────────────────────────────────────────────────────────

function Banner({ banner }: { banner: TenantData["banner"] }) {
  const [showModal, setShowModal] = useState(false);
  if (!banner?.enabled) return null;

  return (
    <>
      <div
        className="w-full py-2.5 px-4 flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <p className="text-white text-sm font-medium text-center">{banner.message}</p>
        {banner.modal?.enabled && (
          <button
            onClick={() => setShowModal(true)}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0 ml-1"
            aria-label="En savoir plus"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {showModal && banner.modal?.enabled && (
        <Modal title={banner.modal.title} onClose={() => setShowModal(false)}>
          <p className="text-gray-600 leading-relaxed">{banner.modal.content}</p>
        </Modal>
      )}
    </>
  );
}

// ── 2. HEADER ────────────────────────────────────────────────────────────────

function Header({ tenant }: { tenant: TenantData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const h = tenant.header;
  const agence = tenant.agence;
  const open = agence ? isAgenceOpen(agence.horaires) : false;
  const displayName = h?.name ?? tenant.name;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo + Name + badge */}
          <a href="#" className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-[#1a1a2e] leading-tight">{displayName}</span>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {open ? "Ouvert" : "Fermé"}
                </span>
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {h?.menu?.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e] transition-colors"
                style={{ "--hover-color": "var(--color-primary)" } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {(h?.phone ?? agence?.phone) && (
              <a
                href={`tel:${(h?.phone ?? agence?.phone ?? "").replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                <Phone className="w-4 h-4" />
                {h?.phone ?? agence?.phone}
              </a>
            )}
            <div className="flex items-center gap-2">
              {h?.socialLinks?.facebook && (
                <a href={h.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {h?.socialLinks?.instagram && (
                <a href={h.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {h?.socialLinks?.tiktok && (
                <a href={h.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Video className="w-5 h-5" />
                </a>
              )}
              {h?.socialLinks?.youtube && (
                <a href={h.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {h?.socialLinks?.linkedin && (
                <a href={h.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {h?.socialLinks?.snapchat && (
                <a href={h.socialLinks.snapchat} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1 pb-2">
            {h?.menu?.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between">
              {(h?.phone ?? agence?.phone) && (
                <a
                  href={`tel:${(h?.phone ?? agence?.phone ?? "").replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  <Phone className="w-4 h-4" />
                  {h?.phone ?? agence?.phone}
                </a>
              )}
              <div className="flex items-center gap-3">
                {h?.socialLinks?.facebook && (
                  <a href={h.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.instagram && (
                  <a href={h.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.tiktok && (
                  <a href={h.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Video className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.youtube && (
                  <a href={h.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.linkedin && (
                  <a href={h.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.snapchat && (
                  <a href={h.socialLinks.snapchat} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                    <Share2 className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ── 3. HERO ──────────────────────────────────────────────────────────────────

function Hero({ tenant }: { tenant: TenantData }) {
  const displayName = tenant.header?.name ?? tenant.name;

  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at -10% -10%, var(--color-primary), transparent 60%)",
          opacity: 0.06,
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36">
        <div className="max-w-3xl">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-5"
            style={{ color: "var(--color-primary)" }}
          >
            Auto-École
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-6">
            Votre auto-école<br />
            <span style={{ color: "var(--color-primary)" }}>{displayName}</span>
          </h2>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">
            Formez-vous avec des moniteurs diplômés d&rsquo;État.
            Réussissez votre permis au meilleur prix.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Nous contacter
              <Phone className="w-4 h-4" />
            </a>
            <a
              href="#formations"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 font-semibold hover:bg-gray-50 transition-colors"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              Voir nos formations
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 4. PAIEMENTS + LABELS STRIP ───────────────────────────────────────────────

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  "Chèque": <Banknote className="w-4 h-4" />,
  "Carte bancaire": <CreditCard className="w-4 h-4" />,
  "Espèces": <Wallet className="w-4 h-4" />,
  "CPF": <GraduationCap className="w-4 h-4" />,
  "Virement": <Banknote className="w-4 h-4" />,
  "Permis à 1€/j": <CreditCard className="w-4 h-4" />,
};

function PaiementsStrip({
  paiements,
  labels,
}: {
  paiements?: string[];
  labels?: TenantData["labels"];
}) {
  if (!paiements?.length && !labels?.length) return null;

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {paiements?.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">{PAYMENT_ICONS[p] ?? <CreditCard className="w-4 h-4" />}</span>
              <span>{p}</span>
            </div>
          ))}
          {labels?.map((label) => (
            <span
              key={label.id}
              className="text-xs font-semibold text-gray-500 px-3 py-1 bg-white rounded-full border border-gray-200"
            >
              {label.nom}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 5. FORMATIONS ─────────────────────────────────────────────────────────────

function FormationCard({
  formation,
  onClick,
  muted = false,
}: {
  formation: TenantFormation;
  onClick: () => void;
  muted?: boolean;
}) {
  const startPrice = formation.tarifs?.[0]?.prix;

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-6 border transition-all group hover:shadow-md w-full ${
        muted ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100 shadow-sm"
      }`}
      style={{ borderColor: undefined }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
      >
        <DynIcon
          name={formation.icon}
          className="w-6 h-6 transition-colors"
          style={{ color: "var(--color-primary)" }}
        />
      </div>
      <h3 className="font-bold text-[#1a1a2e] mb-2">{formation.nom}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{formation.description}</p>
      {startPrice != null && (
        <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
          À partir de {startPrice}€
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2">Voir les détails →</p>
    </button>
  );
}

function FormationModal({ formation, onClose }: { formation: TenantFormation; onClose: () => void }) {
  return (
    <Modal title={formation.nom} onClose={onClose}>
      <p className="text-gray-600 leading-relaxed mb-6">{formation.details}</p>
      <h4 className="font-bold text-[#1a1a2e] mb-4">Tarifs</h4>
      <div className="space-y-3">
        {formation.tarifs.map((t) => (
          <div key={t.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-700 text-sm">{t.label}</span>
            <span className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
              {t.prix}€
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function FormationsList({ formations, onSelect }: { formations: TenantFormation[]; onSelect: (f: TenantFormation) => void }) {
  const [showAll, setShowAll] = useState(false);
  const enAvant = formations.filter((f) => f.enAvant);
  const rest = formations.filter((f) => !f.enAvant);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {enAvant.map((f) => (
          <FormationCard key={f.id} formation={f} onClick={() => onSelect(f)} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 mx-auto text-sm font-medium text-gray-500 hover:text-[#1a1a2e] transition-colors py-2 px-4"
          >
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAll
              ? "Masquer les autres formations"
              : `Voir toutes nos formations (${rest.length} de plus)`}
          </button>

          {showAll && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {rest.map((f) => (
                <FormationCard key={f.id} formation={f} onClick={() => onSelect(f)} muted />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Formations({
  formations,
  formationsMoto,
  formationsRemorque,
}: {
  formations?: TenantFormation[];
  formationsMoto?: TenantFormation[];
  formationsRemorque?: TenantFormation[];
}) {
  const tabs = [
    { key: "voiture",  label: "Voiture",  Icon: Car,   data: formations },
    { key: "moto",     label: "Moto",     Icon: Bike,  data: formationsMoto },
    { key: "remorque", label: "Remorque", Icon: Truck, data: formationsRemorque },
  ].filter((t) => t.data && t.data.length > 0);

  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<TenantFormation | null>(null);

  if (tabs.length === 0) return null;

  const currentFormations = tabs[activeTab]?.data ?? [];

  return (
    <>
      <section id="formations" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
              Nos formations
            </p>
            <h2 className="text-4xl font-bold text-[#1a1a2e]">Choisissez votre formation</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Des formules adaptées à tous les profils, avec un accompagnement personnalisé jusqu&rsquo;à la réussite.
            </p>
          </div>

          {tabs.length > 1 && (
            <div className="flex justify-center gap-2 mb-10">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(i); setSelected(null); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                    activeTab === i
                      ? "text-white border-transparent"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                  style={activeTab === i ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
                >
                  <tab.Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <FormationsList formations={currentFormations} onSelect={setSelected} />
        </div>
      </section>

      {selected && <FormationModal formation={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

// ── 6. PRÉPACODE ─────────────────────────────────────────────────────────────

function Prepacode({ prepacode }: { prepacode?: TenantData["prepacode"] }) {
  if (!prepacode?.enabled) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
              Code de la route
            </p>
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-3">Prépacode en ligne</h2>
            <p className="text-gray-500 leading-relaxed">{prepacode.description}</p>
          </div>
          <a
            href={prepacode.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Accéder à Prépacode
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── 7. AGENCES ────────────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video mb-8">
      {/* Placeholder (real images would use next/image) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
        <MapPin className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm opacity-50 font-medium">{images[idx]}</p>
        <p className="text-xs opacity-30 mt-1">{idx + 1} / {images.length}</p>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 24 : 6,
                  backgroundColor: i === idx ? "white" : "rgba(255,255,255,0.5)",
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AgenceDetail({ agence }: { agence: TenantAgence }) {
  const todayName = getTodayName();

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left: images + description + équipe */}
        <div>
          <ImageCarousel images={agence.images ?? []} />

          <p className="text-gray-600 leading-relaxed mb-8">{agence.description}</p>

          {(agence.equipe?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-xl mb-5">Notre équipe</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agence.equipe?.map((membre) => (
                  <div key={membre.nom} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-gray-400">{membre.nom[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1a2e] text-sm">{membre.nom}</p>
                      <p className="text-xs text-gray-500">{membre.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: horaires + map + contact */}
        <div className="space-y-6">
          {/* Horaires */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-[#1a1a2e]">Horaires d&rsquo;ouverture</h3>
            </div>
            <div className="space-y-1">
              {agence.horaires.map((h) => {
                const isToday = h.jour === todayName;
                return (
                  <div
                    key={h.jour}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-sm"
                    style={
                      isToday
                        ? {
                            backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                            color: "var(--color-primary)",
                            fontWeight: 600,
                          }
                        : undefined
                    }
                  >
                    <span>{h.jour}</span>
                    <div className="flex items-center gap-2">
                      <span>{h.heures}</span>
                      {isToday && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          Aujourd&rsquo;hui
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Maps placeholder */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400" style={{ height: 220 }}>
            <MapPin className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium opacity-60 text-center px-4">{agence.address}</p>
            {agence.coordonnees && (
              <p className="text-xs opacity-30">
                {agence.coordonnees.lat.toFixed(4)}, {agence.coordonnees.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <a
              href={`tel:${agence.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
              <span className="font-medium text-[#1a1a2e] text-sm">{agence.phone}</span>
            </a>
            <a
              href={`mailto:${agence.email}`}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
              <span className="font-medium text-[#1a1a2e] text-sm">{agence.email}</span>
            </a>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
              <span className="text-[#1a1a2e] text-sm">{agence.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avis */}
      {(agence.avis?.temoignages?.length ?? 0) > 0 && (
        <div>
          <div className="text-center mb-10">
            <div className="text-7xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
              {agence.avis?.tauxSatisfaction}%
            </div>
            <p className="text-gray-500 font-medium">de satisfaction client</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agence.avis?.temoignages?.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <StarRating note={t.note} />
                <p className="text-gray-600 mt-3 mb-4 italic text-sm leading-relaxed">
                  &ldquo;{t.texte}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1a1a2e] text-sm">{t.nom}</span>
                  <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AgencesSection({ agence }: { agence?: TenantAgence }) {
  if (!agence) return null;

  return (
    <section id="agence" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Notre agence
          </p>
          <h2 className="text-4xl font-bold text-[#1a1a2e]">Venez nous rendre visite</h2>
        </div>

        <AgenceDetail agence={agence} />
      </div>
    </section>
  );
}

// ── 8. FINANCEMENTS ──────────────────────────────────────────────────────────

function Financements({ financements }: { financements?: TenantData["financements"] }) {
  if (!financements?.length) return null;

  return (
    <section id="financements" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Financement
          </p>
          <h2 className="text-4xl font-bold text-[#1a1a2e]">Solutions de financement</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Plusieurs dispositifs existent pour alléger le coût de votre permis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {financements.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-bold text-[#1a1a2e] mb-2">{f.nom}</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">{f.description}</p>
              {f.lien && (
                <a
                  href={f.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  En savoir plus
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 9. ATOUTS & LABELS ────────────────────────────────────────────────────────

function AtoutsLabels({
  atouts,
  labels,
}: {
  atouts?: TenantData["atouts"];
  labels?: TenantData["labels"];
}) {
  if (!atouts?.length && !labels?.length) return null;

  return (
    <section id="atouts" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        {/* Atouts */}
        {atouts && atouts.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
                Pourquoi nous choisir
              </p>
              <h2 className="text-4xl font-bold text-[#1a1a2e]">Nos atouts</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {atouts.map((a) => (
                <div key={a.id} className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
                  >
                    <DynIcon
                      name={a.icon}
                      className="w-6 h-6"
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a2e] mb-1">{a.titre}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
                Certifications
              </p>
              <h2 className="text-4xl font-bold text-[#1a1a2e]">Labels qualité</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {labels.map((label) => (
                <div key={label.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                  <h3 className="font-bold text-[#1a1a2e] text-xl mb-2">{label.nom}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{label.description}</p>
                  {label.nda && (
                    <p className="text-xs text-gray-400 mb-5 font-mono">NDA : {label.nda}</p>
                  )}
                  {label.documents && label.documents.filter((d) => d.fichier).length > 0 && (
                    <div className="space-y-2 border-t border-gray-200 pt-4">
                      {label.documents
                        .filter((doc) => doc.fichier)
                        .map((doc) => (
                          <a
                            key={doc.nom}
                            href={doc.fichier}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium hover:underline"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <Download className="w-4 h-4" />
                            {doc.nom}
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 10. CONTACT ───────────────────────────────────────────────────────────────

function Contact({
  contact,
  agence,
}: {
  contact?: TenantData["contact"];
  agence?: TenantAgence;
}) {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSent(true);
    },
    []
  );

  if (!contact?.formulaire && !contact?.rdv?.enabled) return null;

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Contact
          </p>
          <h2 className="text-4xl font-bold text-[#1a1a2e]">Prenez contact avec nous</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Une question ? Un projet ? Notre équipe vous répond rapidement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          {contact.formulaire && (
            <div className="lg:col-span-3">
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-[#1a1a2e] text-xl mb-2">Message envoyé !</h3>
                  <p className="text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">Nom *</label>
                      <input
                        required
                        type="text"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors text-[#1a1a2e] text-sm"
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={form.telephone}
                        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors text-[#1a1a2e] text-sm"
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors text-[#1a1a2e] text-sm"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors text-[#1a1a2e] text-sm resize-none"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Envoyer le message
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-5">
            {contact.rdv?.enabled && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                  <h3 className="font-bold text-[#1a1a2e]">Prendre rendez-vous</h3>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  Réservez directement votre créneau en ligne depuis notre agenda.
                </p>
                <a
                  href={contact.rdv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity text-sm"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Réserver en ligne
                </a>
              </div>
            )}

            {agence && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1a1a2e] mb-5">Coordonnées</h3>
                <div className="space-y-4">
                  <a
                    href={`tel:${agence.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-[#1a1a2e] transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    <span className="text-sm">{agence.phone}</span>
                  </a>
                  <a
                    href={`mailto:${agence.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-[#1a1a2e] transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    <span className="text-sm">{agence.email}</span>
                  </a>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                    <span className="text-sm">{agence.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 11. FOOTER ────────────────────────────────────────────────────────────────

function FooterSection({ tenant }: { tenant: TenantData }) {
  const [showMentions, setShowMentions] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const h = tenant.header;
  const footer = tenant.footer;
  const displayName = h?.name ?? tenant.name;
  const qualiopi = tenant.labels?.find((l) => l.id === "qualiopi");

  return (
    <>
      <footer className="bg-[#1a1a2e] text-white pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-3">{displayName}</h3>
              {footer?.agrement && (
                <p className="text-gray-400 text-sm mb-1">N° d&rsquo;agrément : {footer.agrement}</p>
              )}
              {qualiopi?.nda && (
                <p className="text-gray-400 text-sm mb-5">NDA : {qualiopi.nda}</p>
              )}
              <div className="flex items-center gap-3 mt-5">
                {h?.socialLinks?.facebook && (
                  <a href={h.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.instagram && (
                  <a href={h.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.tiktok && (
                  <a href={h.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.youtube && (
                  <a href={h.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.linkedin && (
                  <a href={h.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {h?.socialLinks?.snapchat && (
                  <a href={h.socialLinks.snapchat} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-widest text-gray-400">Navigation</h4>
              <nav className="space-y-3">
                {h?.menu?.map((item) => (
                  <a
                    key={item.anchor}
                    href={`#${item.anchor}`}
                    className="block text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Legal + Other agencies */}
            <div>
              {footer?.autresAgences && footer.autresAgences.length > 0 && (
                <>
                  <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Nos agences</h4>
                  <div className="space-y-2 mb-8">
                    {footer.autresAgences.map((a) => (
                      <a
                        key={a.nom}
                        href={a.url}
                        className="block text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {a.nom}
                      </a>
                    ))}
                  </div>
                </>
              )}
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Légal</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowMentions(true)}
                  className="block text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  Mentions légales
                </button>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="block text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  Politique de confidentialité
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} {displayName}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {showMentions && footer?.mentionsLegales && (
        <Modal title="Mentions légales" onClose={() => setShowMentions(false)}>
          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{footer.mentionsLegales}</p>
        </Modal>
      )}
      {showPrivacy && footer?.politiqueConfidentialite && (
        <Modal title="Politique de confidentialité" onClose={() => setShowPrivacy(false)}>
          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{footer.politiqueConfidentialite}</p>
        </Modal>
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ModerneTemplate({ tenant }: { tenant: TenantData }) {
  const primary = tenant.colors?.primary ?? "#e63946";

  return (
    <div
      style={{ "--color-primary": primary } as React.CSSProperties}
      className="min-h-screen bg-white text-[#1a1a2e]"
    >
      <Banner banner={tenant.banner} />
      <Header tenant={tenant} />

      <main>
        <Hero tenant={tenant} />
        <PaiementsStrip paiements={tenant.paiements} labels={tenant.labels} />
        <Formations
            formations={tenant.formations}
            formationsMoto={tenant.formationsMoto}
            formationsRemorque={tenant.formationsRemorque}
          />
        <Prepacode prepacode={tenant.prepacode} />
        <AgencesSection agence={tenant.agence} />
        <Financements financements={tenant.financements} />
        <AtoutsLabels atouts={tenant.atouts} labels={tenant.labels} />
        <Contact contact={tenant.contact} agence={tenant.agence} />
      </main>

      <FooterSection tenant={tenant} />
    </div>
  );
}
