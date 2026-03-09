"use client";

import { useState } from "react";
import type { TenantData, TenantFinancement } from "@/lib/tenant";
import {
  Field, Textarea, SectionCard, StatusMessage, SaveButton, UploadButton,
  saveSectionData, type SaveStatus,
} from "./shared";

const DEFAULT: TenantFinancement = { id: "", nom: "", logo: "", description: "", lien: "" };

export default function FinancementsTab({ tenant }: { tenant: TenantData }) {
  const [financements, setFinancements] = useState<TenantFinancement[]>(tenant.financements ?? []);
  const [status, setStatus] = useState<SaveStatus>("idle");

  function add() {
    setFinancements((prev) => [...prev, { ...DEFAULT, id: `fin-${Date.now()}` }]);
  }

  function remove(i: number) {
    setFinancements((prev) => prev.filter((_, x) => x !== i));
  }

  function update(i: number, patch: Partial<TenantFinancement>) {
    setFinancements((prev) => prev.map((f, x) => (x === i ? { ...f, ...patch } : f)));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData({ financements }, setStatus);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {financements.map((f, i) => (
        <SectionCard key={f.id || i}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700">{f.nom || `Financement ${i + 1}`}</span>
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">
                Supprimer
              </button>
            </div>
            <Field label="Nom" value={f.nom} onChange={(v) => update(i, { nom: v })} />
            <UploadButton
              label="Logo"
              accept="image/*"
              currentUrl={f.logo}
              onUpload={(url) => update(i, { logo: url })}
              onClear={() => update(i, { logo: "" })}
            />
            <Textarea label="Description" value={f.description} onChange={(v) => update(i, { description: v })} rows={2} />
            <Field label="Lien URL" value={f.lien} onChange={(v) => update(i, { lien: v })} placeholder="https://..." />
          </div>
        </SectionCard>
      ))}

      <button
        type="button"
        onClick={add}
        className="self-start rounded border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
      >
        + Ajouter un financement
      </button>

      <div className="flex items-center gap-4">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
