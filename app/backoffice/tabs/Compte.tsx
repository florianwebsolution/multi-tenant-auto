"use client";

import Link from "next/link";
import { SectionCard } from "./shared";

export default function CompteTab({ adminEmail }: { adminEmail: string }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Compte administrateur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Email de connexion
            </label>
            <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded px-3 py-2">
              {adminEmail}
            </p>
            <p className="text-xs text-zinc-400">
              L&apos;email de connexion est défini lors de la création du compte et ne peut pas être modifié ici.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Mot de passe">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600">
            Pour modifier votre mot de passe, rendez-vous sur la page dédiée.
          </p>
          <Link
            href="/backoffice/password"
            className="self-start rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition"
          >
            Changer mon mot de passe →
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
