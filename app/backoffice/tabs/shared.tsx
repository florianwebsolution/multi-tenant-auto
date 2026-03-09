"use client";

import { useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SaveStatus = "idle" | "saving" | "success" | "error";

// ── Constants ─────────────────────────────────────────────────────────────────

export const AVAILABLE_ICONS = [
  { value: "car", label: "Voiture" },
  { value: "users", label: "Personnes" },
  { value: "shield", label: "Bouclier" },
  { value: "award", label: "Récompense" },
  { value: "bike", label: "Vélo / Moto" },
  { value: "truck", label: "Camion" },
  { value: "zap", label: "Éclair" },
  { value: "heart", label: "Cœur" },
  { value: "leaf", label: "Feuille" },
  { value: "globe", label: "Globe" },
  { value: "home", label: "Maison" },
  { value: "target", label: "Cible" },
  { value: "gauge", label: "Jauge" },
  { value: "graduation-cap", label: "Diplôme" },
  { value: "credit-card", label: "Carte bancaire" },
];

export const PAIEMENTS_OPTIONS = [
  "Chèque",
  "Carte bancaire",
  "Espèces",
  "CPF",
  "Virement",
  "Permis à 1€/j",
];

export const FIXED_DOCUMENTS = [
  "Critère 1.2 Les enjeux de la formation",
  "Critère 1.3 Le règlement intérieur",
  "Critère 1.6 La formation Post Permis",
  "Critère 1.7 La valorisation de la conduite accompagnée et supervisée",
  "Critère 2.2 L'évaluation de formation",
  "Critère 2.3 Procédé de positionnement (si demande Qualiopi)",
  "Critère 2.4 La prise en compte d'un handicap",
  "Critère 3.1 Le parcours de formation",
  "Critère 7.4 Les réclamations",
];

// ── API helpers ───────────────────────────────────────────────────────────────

export async function saveSectionData(
  data: object,
  setStatus: (s: SaveStatus) => void
): Promise<void> {
  setStatus("saving");
  try {
    const res = await fetch("/api/tenant/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? "success" : "error");
    if (res.ok) setTimeout(() => setStatus("idle"), 3000);
  } catch {
    setStatus("error");
  }
}

export async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/tenant/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const json = await res.json() as { url: string };
    return json.url;
  } catch {
    return null;
  }
}

// ── Shared UI components ──────────────────────────────────────────────────────

const inputCls =
  "rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 w-full";
const labelCls = "text-xs font-semibold text-zinc-500 uppercase tracking-wide";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} resize-y`}
      />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-zinc-800"
      />
      <span className="text-sm text-zinc-700">{label}</span>
    </label>
  );
}

export function IconSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} bg-white`}
      >
        {AVAILABLE_ICONS.map((icon) => (
          <option key={icon.value} value={icon.value}>
            {icon.label} ({icon.value})
          </option>
        ))}
      </select>
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-5">
      {title && (
        <h3 className="text-sm font-semibold text-zinc-700 mb-4 pb-3 border-b border-zinc-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function StatusMessage({ status }: { status: SaveStatus }) {
  if (status === "success")
    return (
      <p className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
        Modifications enregistrées.
      </p>
    );
  if (status === "error")
    return (
      <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
        Erreur lors de la sauvegarde.
      </p>
    );
  return null;
}

export function SaveButton({ status }: { status: SaveStatus }) {
  return (
    <button
      type="submit"
      disabled={status === "saving"}
      className="rounded bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition"
    >
      {status === "saving" ? "Enregistrement…" : "Sauvegarder"}
    </button>
  );
}

export function UploadButton({
  label,
  accept = "*",
  currentUrl,
  onUpload,
  onClear,
}: {
  label: string;
  accept?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) onUpload(url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={labelCls}>{label}</label>}
      {currentUrl && (
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 text-xs text-zinc-500">
          <span className="flex-1 truncate">{currentUrl}</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-red-400 hover:text-red-600 font-medium"
            >
              ×
            </button>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="self-start rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition"
      >
        {uploading ? "Envoi…" : currentUrl ? "Remplacer" : "Choisir un fichier"}
      </button>
    </div>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`text-xl leading-none ${i <= value ? "text-yellow-400" : "text-zinc-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
