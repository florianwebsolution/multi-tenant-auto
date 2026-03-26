"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TenantData } from "@/lib/tenant";

import GeneralTab from "./tabs/General";
import AgencesTab from "./tabs/Agences";
import HeaderNavTab from "./tabs/HeaderNav";
import FormationsTab from "./tabs/Formations";
import FinancementsTab from "./tabs/Financements";
import LabelsAtoutsTab from "./tabs/LabelsAtouts";
import ContactFooterTab from "./tabs/ContactFooter";
import CompteTab from "./tabs/Compte";

const TABS = [
  { id: "general",      label: "Général" },
  { id: "agences",      label: "Agence" },
  { id: "header",       label: "Header & Navigation" },
  { id: "formations",   label: "Formations" },
  { id: "financements", label: "Financements" },
  { id: "labels",       label: "Labels & Atouts" },
  { id: "contact",      label: "Contact & Footer" },
  { id: "compte",       label: "Compte" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BackofficeDashboard({
  tenant,
  adminEmail,
}: {
  tenant: TenantData;
  adminEmail: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("general");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/backoffice/login");
  }

  const displayName = tenant.header?.name ?? tenant.name;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-sm font-semibold text-zinc-800">
          Backoffice — <span className="text-zinc-500">{displayName}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition"
        >
          Déconnexion
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-zinc-200 shrink-0 sticky top-[49px] self-start h-[calc(100vh-49px)] overflow-y-auto">
          <ul className="py-3">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    activeTab === tab.id
                      ? "bg-zinc-100 text-zinc-900 font-medium border-l-2 border-zinc-900"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="flex-1 p-8 max-w-4xl min-w-0">
          {activeTab === "general"      && <GeneralTab tenant={tenant} />}
          {activeTab === "agences"      && <AgencesTab tenant={tenant} />}
          {activeTab === "header"       && <HeaderNavTab tenant={tenant} />}
          {activeTab === "formations"   && <FormationsTab tenant={tenant} />}
          {activeTab === "financements" && <FinancementsTab tenant={tenant} />}
          {activeTab === "labels"       && <LabelsAtoutsTab tenant={tenant} />}
          {activeTab === "contact"      && <ContactFooterTab tenant={tenant} />}
          {activeTab === "compte"       && <CompteTab adminEmail={adminEmail} />}
        </main>
      </div>
    </div>
  );
}
