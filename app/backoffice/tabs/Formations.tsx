"use client";

import { useState } from "react";
import type { TenantData, TenantFormation } from "@/lib/tenant";
import {
  Field, Textarea, Toggle, IconSelect, SectionCard, StatusMessage, SaveButton,
  saveSectionData, type SaveStatus,
} from "./shared";

const DEFAULT_FORMATION: TenantFormation = {
  id: "",
  nom: "",
  icon: "car",
  description: "",
  details: "",
  enAvant: false,
  tarifs: [],
};

export default function FormationsTab({ tenant }: { tenant: TenantData }) {
  const [formations, setFormations] = useState<TenantFormation[]>(tenant.formations ?? []);
  const [status, setStatus] = useState<SaveStatus>("idle");

  function add() {
    setFormations((prev) => [...prev, { ...DEFAULT_FORMATION, id: `f-${Date.now()}` }]);
  }

  function remove(i: number) {
    setFormations((prev) => prev.filter((_, x) => x !== i));
  }

  function update(i: number, patch: Partial<TenantFormation>) {
    setFormations((prev) => prev.map((f, x) => (x === i ? { ...f, ...patch } : f)));
  }

  function addTarif(fi: number) {
    update(fi, { tarifs: [...formations[fi].tarifs, { label: "", prix: 0 }] });
  }

  function removeTarif(fi: number, ti: number) {
    update(fi, { tarifs: formations[fi].tarifs.filter((_, x) => x !== ti) });
  }

  function updateTarif(fi: number, ti: number, field: "label" | "prix", raw: string) {
    update(fi, {
      tarifs: formations[fi].tarifs.map((t, x) =>
        x === ti ? { ...t, [field]: field === "prix" ? parseFloat(raw) || 0 : raw } : t
      ),
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData({ formations }, setStatus);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {formations.map((f, fi) => (
        <SectionCard key={f.id || fi}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700">{f.nom || `Formation ${fi + 1}`}</span>
              <button type="button" onClick={() => remove(fi)} className="text-xs text-red-400 hover:text-red-600">
                Supprimer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom" value={f.nom} onChange={(v) => update(fi, { nom: v })} />
              <IconSelect label="Icône" value={f.icon} onChange={(v) => update(fi, { icon: v })} />
            </div>

            <Field label="Description courte" value={f.description} onChange={(v) => update(fi, { description: v })} />
            <Textarea label="Détails complets" value={f.details} onChange={(v) => update(fi, { details: v })} rows={4} />
            <Toggle label="Mettre en avant" checked={f.enAvant} onChange={(v) => update(fi, { enAvant: v })} />

            {/* Tarifs */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tarifs</label>
              {f.tarifs.map((t, ti) => (
                <div key={ti} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) => updateTarif(fi, ti, "label", e.target.value)}
                    placeholder="Ex : Forfait 20h"
                    className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 flex-1"
                  />
                  <input
                    type="number"
                    value={t.prix}
                    onChange={(e) => updateTarif(fi, ti, "prix", e.target.value)}
                    placeholder="Prix €"
                    className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 w-24"
                  />
                  <button type="button" onClick={() => removeTarif(fi, ti)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTarif(fi)}
                className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50"
              >
                + Ajouter un tarif
              </button>
            </div>
          </div>
        </SectionCard>
      ))}

      <button
        type="button"
        onClick={add}
        className="self-start rounded border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
      >
        + Ajouter une formation
      </button>

      <div className="flex items-center gap-4">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
