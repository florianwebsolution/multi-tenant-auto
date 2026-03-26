"use client";

import { useState } from "react";
import type { TenantData, TenantAgence, TenantTemoignage } from "@/lib/tenant";
import {
  Field, Textarea, Toggle, SectionCard, StatusMessage, SaveButton, UploadButton, StarInput,
  saveSectionData, type SaveStatus,
} from "./shared";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function defaultAgence(): TenantAgence {
  return {
    nom: "",
    address: "",
    phone: "",
    email: "",
    agrement: "",
    horaires: JOURS.map((jour) => ({ jour, heures: "09h00 - 18h00" })),
    coordonnees: { lat: 48.8566, lng: 2.3522 },
    description: "",
    images: [],
    equipe: [],
    galerie: [],
    avis: {
      vroomvroom: { enabled: false, url: "" },
      temoignages: [],
      tauxSatisfaction: 0,
    },
  };
}

export default function AgencesTab({ tenant }: { tenant: TenantData }) {
  const [agence, setAgence] = useState<TenantAgence>(tenant.agence ?? defaultAgence());
  const [status, setStatus] = useState<SaveStatus>("idle");

  function updateAgence(patch: Partial<TenantAgence>) {
    setAgence((prev) => ({ ...prev, ...patch }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveSectionData({ agence }, setStatus);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {/* Identité */}
      <SectionCard title="Identité">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom de l'agence" value={agence.nom ?? ""} onChange={(v) => updateAgence({ nom: v })} />
          <Field label="Agrément" value={agence.agrement ?? ""} onChange={(v) => updateAgence({ agrement: v })} />
          <Field label="Adresse" value={agence.address} onChange={(v) => updateAgence({ address: v })} />
          <Field label="Téléphone" type="tel" value={agence.phone} onChange={(v) => updateAgence({ phone: v })} />
          <Field label="Email" type="email" value={agence.email} onChange={(v) => updateAgence({ email: v })} />
        </div>
      </SectionCard>

      {/* GPS */}
      <SectionCard title="Coordonnées GPS">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Latitude"
            value={String(agence.coordonnees?.lat ?? "")}
            onChange={(v) => updateAgence({ coordonnees: { lat: parseFloat(v) || 0, lng: agence.coordonnees?.lng ?? 0 } })}
          />
          <Field
            label="Longitude"
            value={String(agence.coordonnees?.lng ?? "")}
            onChange={(v) => updateAgence({ coordonnees: { lat: agence.coordonnees?.lat ?? 0, lng: parseFloat(v) || 0 } })}
          />
        </div>
      </SectionCard>

      {/* Description */}
      <SectionCard title="Description">
        <Textarea
          label="Texte de présentation"
          value={agence.description ?? ""}
          onChange={(v) => updateAgence({ description: v })}
          rows={4}
        />
      </SectionCard>

      {/* Horaires */}
      <SectionCard title="Horaires d'ouverture">
        <div className="flex flex-col gap-2">
          {agence.horaires.map((h, hi) => (
            <div key={h.jour} className="flex items-center gap-3">
              <span className="text-sm text-zinc-600 w-24 flex-shrink-0">{h.jour}</span>
              <input
                type="text"
                value={h.heures}
                onChange={(e) => {
                  const horaires = agence.horaires.map((hh, hhi) =>
                    hhi === hi ? { ...hh, heures: e.target.value } : hh
                  );
                  updateAgence({ horaires });
                }}
                placeholder="09h00 - 18h00 ou Fermé"
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 flex-1 max-w-xs"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Images carousel */}
      <SectionCard title="Images (carousel)">
        <div className="flex flex-col gap-3">
          {(agence.images ?? []).map((img, ii) => (
            <div key={ii} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 text-xs text-zinc-500">
              <span className="flex-1 truncate">{img}</span>
              <button
                type="button"
                onClick={() => updateAgence({ images: (agence.images ?? []).filter((_, x) => x !== ii) })}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          ))}
          <UploadButton
            label="Ajouter une image"
            accept="image/*"
            onUpload={(url) => updateAgence({ images: [...(agence.images ?? []), url] })}
          />
        </div>
      </SectionCard>

      {/* Équipe */}
      <SectionCard title="Équipe pédagogique">
        <div className="flex flex-col gap-4">
          {(agence.equipe ?? []).map((membre, mi) => (
            <div key={mi} className="border border-zinc-100 rounded-lg p-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Nom"
                  value={membre.nom}
                  onChange={(v) => {
                    const equipe = (agence.equipe ?? []).map((m, x) => (x === mi ? { ...m, nom: v } : m));
                    updateAgence({ equipe });
                  }}
                />
                <Field
                  label="Rôle"
                  value={membre.role}
                  onChange={(v) => {
                    const equipe = (agence.equipe ?? []).map((m, x) => (x === mi ? { ...m, role: v } : m));
                    updateAgence({ equipe });
                  }}
                />
              </div>
              <UploadButton
                label="Photo"
                accept="image/*"
                currentUrl={membre.photo}
                onUpload={(url) => {
                  const equipe = (agence.equipe ?? []).map((m, x) => (x === mi ? { ...m, photo: url } : m));
                  updateAgence({ equipe });
                }}
                onClear={() => {
                  const equipe = (agence.equipe ?? []).map((m, x) => (x === mi ? { ...m, photo: "" } : m));
                  updateAgence({ equipe });
                }}
              />
              <button
                type="button"
                onClick={() => updateAgence({ equipe: (agence.equipe ?? []).filter((_, x) => x !== mi) })}
                className="self-start text-xs text-red-400 hover:text-red-600"
              >
                Supprimer ce membre
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateAgence({ equipe: [...(agence.equipe ?? []), { nom: "", role: "", photo: "" }] })
            }
            className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50"
          >
            + Ajouter un membre
          </button>
        </div>
      </SectionCard>

      {/* Galerie */}
      <SectionCard title="Galerie photos">
        <div className="flex flex-col gap-3">
          {(agence.galerie ?? []).map((img, ii) => (
            <div key={ii} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 text-xs text-zinc-500">
              <span className="flex-1 truncate">{img}</span>
              <button
                type="button"
                onClick={() => updateAgence({ galerie: (agence.galerie ?? []).filter((_, x) => x !== ii) })}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          ))}
          <UploadButton
            label="Ajouter une photo"
            accept="image/*"
            onUpload={(url) => updateAgence({ galerie: [...(agence.galerie ?? []), url] })}
          />
        </div>
      </SectionCard>

      {/* Avis */}
      <SectionCard title="Avis clients">
        <div className="flex flex-col gap-5">
          {/* Taux satisfaction */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Taux de satisfaction (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={agence.avis?.tauxSatisfaction ?? 0}
              onChange={(e) =>
                updateAgence({
                  avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), tauxSatisfaction: parseInt(e.target.value) || 0 },
                })
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 w-28"
            />
          </div>

          {/* VroomVroom */}
          <div className="flex flex-col gap-2">
            <Toggle
              label="Activer le lien VroomVroom"
              checked={agence.avis?.vroomvroom.enabled ?? false}
              onChange={(v) =>
                updateAgence({
                  avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), vroomvroom: { ...(agence.avis?.vroomvroom ?? { enabled: false, url: "" }), enabled: v } },
                })
              }
            />
            <Field
              label="URL VroomVroom"
              value={agence.avis?.vroomvroom.url ?? ""}
              onChange={(v) =>
                updateAgence({
                  avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), vroomvroom: { ...(agence.avis?.vroomvroom ?? { enabled: false, url: "" }), url: v } },
                })
              }
              placeholder="https://www.vroomvroom.fr/..."
            />
          </div>

          {/* Témoignages */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Témoignages
            </label>
            {(agence.avis?.temoignages ?? []).map((t, ti) => (
              <div key={ti} className="border border-zinc-100 rounded-lg p-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Nom"
                    value={t.nom}
                    onChange={(v) => {
                      const temoignages = (agence.avis?.temoignages ?? []).map((x, xi) =>
                        xi === ti ? { ...x, nom: v } : x
                      );
                      updateAgence({ avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages } });
                    }}
                  />
                  <Field
                    label="Date"
                    type="date"
                    value={t.date}
                    onChange={(v) => {
                      const temoignages = (agence.avis?.temoignages ?? []).map((x, xi) =>
                        xi === ti ? { ...x, date: v } : x
                      );
                      updateAgence({ avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages } });
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Note</label>
                  <StarInput
                    value={t.note}
                    onChange={(n) => {
                      const temoignages = (agence.avis?.temoignages ?? []).map((x, xi) =>
                        xi === ti ? { ...x, note: n } : x
                      );
                      updateAgence({ avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages } });
                    }}
                  />
                </div>
                <Textarea
                  label="Texte"
                  value={t.texte}
                  onChange={(v) => {
                    const temoignages = (agence.avis?.temoignages ?? []).map((x, xi) =>
                      xi === ti ? { ...x, texte: v } : x
                    );
                    updateAgence({ avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages } });
                  }}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => {
                    const temoignages = (agence.avis?.temoignages ?? []).filter((_, xi) => xi !== ti);
                    updateAgence({ avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages } });
                  }}
                  className="self-start text-xs text-red-400 hover:text-red-600"
                >
                  Supprimer ce témoignage
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newT: TenantTemoignage = {
                  nom: "",
                  note: 5,
                  texte: "",
                  date: new Date().toISOString().split("T")[0],
                };
                updateAgence({
                  avis: { ...(agence.avis ?? { vroomvroom: { enabled: false, url: "" }, temoignages: [], tauxSatisfaction: 0 }), temoignages: [...(agence.avis?.temoignages ?? []), newT] },
                });
              }}
              className="self-start rounded border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50"
            >
              + Ajouter un témoignage
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Footer actions */}
      <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-zinc-200">
        <SaveButton status={status} />
        <StatusMessage status={status} />
      </div>
    </form>
  );
}
