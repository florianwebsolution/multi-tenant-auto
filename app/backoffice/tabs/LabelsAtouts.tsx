"use client";

import { useState } from "react";
import type { TenantData, TenantLabel, TenantAtout } from "@/lib/tenant";
import {
  Field, Textarea, IconSelect, SectionCard, StatusMessage, SaveButton, UploadButton,
  FIXED_DOCUMENTS, saveSectionData, type SaveStatus,
} from "./shared";

function defaultLabel(): TenantLabel {
  return {
    id: `label-${Date.now()}`,
    nom: "",
    logo: "",
    description: "",
    documents: FIXED_DOCUMENTS.map((nom) => ({ nom, fichier: "" })),
  };
}

function defaultAtout(): TenantAtout {
  return { id: `atout-${Date.now()}`, titre: "", description: "", icon: "shield" };
}

/** Normalise a label from the JSON so every fixed document slot exists */
function normaliseLabel(l: TenantLabel): TenantLabel {
  return {
    ...l,
    documents: FIXED_DOCUMENTS.map((nom) => {
      const existing = l.documents?.find((d) => d.nom === nom);
      return { nom, fichier: existing?.fichier ?? "" };
    }),
  };
}

export default function LabelsAtoutsTab({ tenant }: { tenant: TenantData }) {
  const [labels, setLabels] = useState<TenantLabel[]>(
    (tenant.labels ?? []).map(normaliseLabel)
  );
  const [atouts, setAtouts] = useState<TenantAtout[]>(tenant.atouts ?? []);
  const [status, setStatus] = useState<SaveStatus>("idle");

  // ── Labels ──────────────────────────────────────────────────────────────────

  function addLabel() {
    setLabels((prev) => [...prev, defaultLabel()]);
  }

  function removeLabel(i: number) {
    setLabels((prev) => prev.filter((_, x) => x !== i));
  }

  function updateLabel(i: number, patch: Partial<TenantLabel>) {
    setLabels((prev) => prev.map((l, x) => (x === i ? { ...l, ...patch } : l)));
  }

  function setDocFichier(li: number, docNom: string, fichier: string) {
    setLabels((prev) =>
      prev.map((l, x) =>
        x === li
          ? {
              ...l,
              documents: (l.documents ?? []).map((d) =>
                d.nom === docNom ? { ...d, fichier } : d
              ),
            }
          : l
      )
    );
  }

  // ── Atouts ──────────────────────────────────────────────────────────────────

  function addAtout() {
    setAtouts((prev) => [...prev, defaultAtout()]);
  }

  function removeAtout(i: number) {
    setAtouts((prev) => prev.filter((_, x) => x !== i));
  }

  function updateAtout(i: number, patch: Partial<TenantAtout>) {
    setAtouts((prev) => prev.map((a, x) => (x === i ? { ...a, ...patch } : a)));
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Strip empty-fichier documents before saving (keep array sparse)
    const labelsToSave = labels.map((l) => ({
      ...l,
      documents: (l.documents ?? []).filter((d) => d.fichier),
    }));
    await saveSectionData({ labels: labelsToSave, atouts }, setStatus);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {/* ── Labels ── */}
      <div>
        <h3 className="text-base font-semibold text-zinc-800 mb-4">Labels qualité</h3>
        <div className="flex flex-col gap-5">
          {labels.map((label, li) => (
            <SectionCard key={label.id || li}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-700">
                    {label.nom || `Label ${li + 1}`}
                  </span>
                  <button type="button" onClick={() => removeLabel(li)} className="text-xs text-red-400 hover:text-red-600">
                    Supprimer
                  </button>
                </div>

                <Field label="Nom" value={label.nom} onChange={(v) => updateLabel(li, { nom: v })} />
                <UploadButton
                  label="Logo"
                  accept="image/*"
                  currentUrl={label.logo}
                  onUpload={(url) => updateLabel(li, { logo: url })}
                  onClear={() => updateLabel(li, { logo: "" })}
                />
                <Textarea
                  label="Description"
                  value={label.description}
                  onChange={(v) => updateLabel(li, { description: v })}
                  rows={2}
                />
                <Field
                  label="NDA (si applicable)"
                  value={label.nda ?? ""}
                  onChange={(v) => updateLabel(li, { nda: v })}
                  placeholder="NDA 12 34 12345 12"
                />

                {/* Fixed documents */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Documents PDF
                  </label>
                  <div className="flex flex-col gap-3 mt-2">
                    {FIXED_DOCUMENTS.map((docNom) => {
                      const current = label.documents?.find((d) => d.nom === docNom)?.fichier ?? "";
                      return (
                        <div key={docNom} className="border-l-2 border-zinc-100 pl-3 flex flex-col gap-1">
                          <span className="text-xs text-zinc-600">{docNom}</span>
                          <UploadButton
                            label=""
                            accept=".pdf"
                            currentUrl={current}
                            onUpload={(url) => setDocFichier(li, docNom, url)}
                            onClear={() => setDocFichier(li, docNom, "")}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}

          <button
            type="button"
            onClick={addLabel}
            className="self-start rounded border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
          >
            + Ajouter un label
          </button>
        </div>
      </div>

      {/* ── Atouts ── */}
      <div>
        <h3 className="text-base font-semibold text-zinc-800 mb-4">Atouts</h3>
        <div className="flex flex-col gap-5">
          {atouts.map((a, ai) => (
            <SectionCard key={a.id || ai}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-700">
                    {a.titre || `Atout ${ai + 1}`}
                  </span>
                  <button type="button" onClick={() => removeAtout(ai)} className="text-xs text-red-400 hover:text-red-600">
                    Supprimer
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Titre" value={a.titre} onChange={(v) => updateAtout(ai, { titre: v })} />
                  <IconSelect label="Icône" value={a.icon} onChange={(v) => updateAtout(ai, { icon: v })} />
                </div>
                <Textarea
                  label="Description"
                  value={a.description}
                  onChange={(v) => updateAtout(ai, { description: v })}
                  rows={2}
                />
              </div>
            </SectionCard>
          ))}

          <button
            type="button"
            onClick={addAtout}
            className="self-start rounded border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
          >
            + Ajouter un atout
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
