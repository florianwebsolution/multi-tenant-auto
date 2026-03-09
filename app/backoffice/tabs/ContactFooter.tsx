"use client";

import { useState } from "react";
import type { TenantData } from "@/lib/tenant";
import {
  Field, Textarea, Toggle, SectionCard, StatusMessage, SaveButton,
  saveSectionData, type SaveStatus,
} from "./shared";

export default function ContactFooterTab({ tenant }: { tenant: TenantData }) {
  const [formulaire, setFormulaire] = useState(tenant.contact?.formulaire ?? false);
  const [rdvEnabled, setRdvEnabled] = useState(tenant.contact?.rdv?.enabled ?? false);
  const [rdvUrl, setRdvUrl] = useState(tenant.contact?.rdv?.url ?? "");

  const [agrement, setAgrement] = useState(tenant.footer?.agrement ?? "");
  const [mentionsLegales, setMentionsLegales] = useState(tenant.footer?.mentionsLegales ?? "");
  const [politique, setPolitique] = useState(tenant.footer?.politiqueConfidentialite ?? "");

  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData(
      {
        contact: { formulaire, rdv: { enabled: rdvEnabled, url: rdvUrl } },
        footer: {
          ...(tenant.footer ?? {}),
          agrement,
          mentionsLegales,
          politiqueConfidentialite: politique,
        },
      },
      setStatus
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <SectionCard title="Formulaire de contact">
        <div className="flex flex-col gap-4">
          <Toggle label="Activer le formulaire de contact" checked={formulaire} onChange={setFormulaire} />
          <hr className="border-zinc-100" />
          <Toggle label="Activer la prise de rendez-vous en ligne" checked={rdvEnabled} onChange={setRdvEnabled} />
          <Field
            label="URL Calendly / RDV"
            value={rdvUrl}
            onChange={setRdvUrl}
            placeholder="https://calendly.com/..."
          />
        </div>
      </SectionCard>

      <SectionCard title="Footer">
        <div className="flex flex-col gap-4">
          <Field
            label="N° d'agrément"
            value={agrement}
            onChange={setAgrement}
            placeholder="E 12 075 0001 0"
          />
          <Textarea label="Mentions légales" value={mentionsLegales} onChange={setMentionsLegales} rows={8} />
          <Textarea
            label="Politique de confidentialité"
            value={politique}
            onChange={setPolitique}
            rows={8}
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
