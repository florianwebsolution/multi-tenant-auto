"use client";

import { useState } from "react";
import type { TenantData } from "@/lib/tenant";
import {
  Field, SectionCard, StatusMessage, SaveButton, UploadButton,
  saveSectionData, type SaveStatus,
} from "./shared";

export default function HeaderNavTab({ tenant }: { tenant: TenantData }) {
  const h = tenant.header ?? {};

  const [logo, setLogo] = useState(h.logo ?? "");
  const [name, setName] = useState(h.name ?? tenant.name ?? "");
  const [phone, setPhone] = useState(h.phone ?? tenant.agence?.phone ?? "");
  const [address, setAddress] = useState(h.address ?? tenant.agence?.address ?? "");
  const [facebook, setFacebook] = useState(h.socialLinks?.facebook ?? "");
  const [instagram, setInstagram] = useState(h.socialLinks?.instagram ?? "");
  const [tiktok, setTiktok] = useState(h.socialLinks?.tiktok ?? "");
  const [youtube, setYoutube] = useState(h.socialLinks?.youtube ?? "");
  const [linkedin, setLinkedin] = useState(h.socialLinks?.linkedin ?? "");
  const [snapchat, setSnapchat] = useState(h.socialLinks?.snapchat ?? "");
  const [menu, setMenu] = useState<{ label: string; anchor: string }[]>(h.menu ?? []);

  const [status, setStatus] = useState<SaveStatus>("idle");

  function addMenuItem() {
    setMenu((prev) => [...prev, { label: "", anchor: "" }]);
  }

  function removeMenuItem(i: number) {
    setMenu((prev) => prev.filter((_, x) => x !== i));
  }

  function updateMenuItem(i: number, field: "label" | "anchor", value: string) {
    setMenu((prev) => prev.map((item, x) => (x === i ? { ...item, [field]: value } : item)));
  }

  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= menu.length) return;
    setMenu((prev) => {
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData(
      {
        header: {
          logo,
          name,
          phone,
          address,
          socialLinks: { facebook, instagram, tiktok, youtube, linkedin, snapchat },
          menu,
        },
      },
      setStatus
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <SectionCard title="Logo & identité">
        <div className="flex flex-col gap-4">
          <UploadButton
            label="Logo"
            accept="image/*"
            currentUrl={logo}
            onUpload={setLogo}
            onClear={() => setLogo("")}
          />
          <Field label="Nom de l'auto-école" value={name} onChange={setName} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Téléphone" type="tel" value={phone} onChange={setPhone} />
            <Field label="Adresse" value={address} onChange={setAddress} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Réseaux sociaux">
        <div className="flex flex-col gap-4">
          <Field label="Facebook" value={facebook} onChange={setFacebook} placeholder="https://facebook.com/..." />
          <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/..." />
          <Field label="TikTok" value={tiktok} onChange={setTiktok} placeholder="https://tiktok.com/@..." />
          <Field label="YouTube" value={youtube} onChange={setYoutube} placeholder="https://youtube.com/@..." />
          <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/company/..." />
          <Field label="Snapchat" value={snapchat} onChange={setSnapchat} placeholder="https://snapchat.com/add/..." />
        </div>
      </SectionCard>

      <SectionCard title="Menu de navigation">
        <div className="flex flex-col gap-2">
          {menu.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateMenuItem(i, "label", e.target.value)}
                placeholder="Label"
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 flex-1"
              />
              <input
                type="text"
                value={item.anchor}
                onChange={(e) => updateMenuItem(i, "anchor", e.target.value)}
                placeholder="ancre"
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 w-36 font-mono"
              />
              <button type="button" onClick={() => moveItem(i, -1)} className="text-zinc-400 hover:text-zinc-700 px-1 text-sm" title="Monter">↑</button>
              <button type="button" onClick={() => moveItem(i, 1)} className="text-zinc-400 hover:text-zinc-700 px-1 text-sm" title="Descendre">↓</button>
              <button type="button" onClick={() => removeMenuItem(i)} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMenuItem}
            className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 mt-1"
          >
            + Ajouter un lien
          </button>
        </div>
      </SectionCard>

      <div className="flex items-center gap-4">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
