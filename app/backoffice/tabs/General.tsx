"use client";

import { useState } from "react";
import type { TenantData } from "@/lib/tenant";
import {
  Field, Textarea, Toggle, SectionCard, StatusMessage, SaveButton,
  PAIEMENTS_OPTIONS, saveSectionData, type SaveStatus,
} from "./shared";

export default function GeneralTab({ tenant }: { tenant: TenantData }) {
  const [bannerEnabled, setBannerEnabled] = useState(tenant.banner?.enabled ?? false);
  const [bannerMessage, setBannerMessage] = useState(tenant.banner?.message ?? "");
  const [modalEnabled, setModalEnabled] = useState(tenant.banner?.modal?.enabled ?? false);
  const [modalTitle, setModalTitle] = useState(tenant.banner?.modal?.title ?? "");
  const [modalContent, setModalContent] = useState(tenant.banner?.modal?.content ?? "");

  const [primaryColor, setPrimaryColor] = useState(tenant.colors?.primary ?? "#e63946");
  const [template, setTemplate] = useState(tenant.template ?? "moderne");

  const [paiements, setPaiements] = useState<string[]>(tenant.paiements ?? []);

  const [prepacodeEnabled, setPrepacodeEnabled] = useState(tenant.prepacode?.enabled ?? false);
  const [prepacodeDesc, setPrepacodeDesc] = useState(tenant.prepacode?.description ?? "");
  const [prepacodeUrl, setPrepacodeUrl] = useState(tenant.prepacode?.url ?? "");

  const [status, setStatus] = useState<SaveStatus>("idle");

  function togglePaiement(p: string) {
    setPaiements((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData(
      {
        banner: {
          enabled: bannerEnabled,
          message: bannerMessage,
          modal: { enabled: modalEnabled, title: modalTitle, content: modalContent },
        },
        colors: { ...(tenant.colors ?? {}), primary: primaryColor },
        template,
        paiements,
        prepacode: { enabled: prepacodeEnabled, description: prepacodeDesc, url: prepacodeUrl },
      },
      setStatus
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {/* Bandeau */}
      <SectionCard title="Bandeau d'annonce">
        <div className="flex flex-col gap-4">
          <Toggle label="Activer le bandeau" checked={bannerEnabled} onChange={setBannerEnabled} />
          <Field
            label="Message du bandeau"
            value={bannerMessage}
            onChange={setBannerMessage}
            placeholder="Ex : 🎉 Nouvelle formation disponible !"
          />
          <hr className="border-zinc-100" />
          <Toggle label="Activer la modale (bouton ℹ️)" checked={modalEnabled} onChange={setModalEnabled} />
          <Field label="Titre de la modale" value={modalTitle} onChange={setModalTitle} />
          <Textarea label="Contenu de la modale" value={modalContent} onChange={setModalContent} rows={3} />
        </div>
      </SectionCard>

      {/* Apparence */}
      <SectionCard title="Apparence">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Couleur primaire</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-20 rounded border border-zinc-300 cursor-pointer p-1 bg-white"
              />
              <span className="text-sm text-zinc-500 font-mono">{primaryColor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 bg-white w-48"
            >
              <option value="moderne">Moderne</option>
              <option value="classique">Classique</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Paiements */}
      <SectionCard title="Moyens de paiement acceptés">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {PAIEMENTS_OPTIONS.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paiements.includes(p)}
                onChange={() => togglePaiement(p)}
                className="w-4 h-4 rounded accent-zinc-800"
              />
              <span className="text-sm text-zinc-700">{p}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Prépacode */}
      <SectionCard title="Prépacode en ligne">
        <div className="flex flex-col gap-4">
          <Toggle label="Activer la section Prépacode" checked={prepacodeEnabled} onChange={setPrepacodeEnabled} />
          <Textarea label="Description" value={prepacodeDesc} onChange={setPrepacodeDesc} rows={2} />
          <Field
            label="URL Prépacode"
            value={prepacodeUrl}
            onChange={setPrepacodeUrl}
            placeholder="https://www.prepacode-online.com/?ref=..."
          />
        </div>
      </SectionCard>

      <div className="flex items-center gap-4">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
