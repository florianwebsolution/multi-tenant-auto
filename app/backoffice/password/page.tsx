"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "saving" | "success" | "error";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError(null);
    setServerError(null);

    if (next.length < 8) {
      setClientError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (next !== confirm) {
      setClientError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setStatus("saving");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setServerError("Impossible de contacter le serveur.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans">
      <header className="flex items-center gap-4 bg-white border-b border-zinc-200 px-8 py-4">
        <Link
          href="/backoffice"
          className="text-sm text-zinc-500 transition hover:text-zinc-800"
        >
          ← Retour
        </Link>
        <h1 className="text-lg font-semibold text-zinc-800">
          Changer mon mot de passe
        </h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <section className="rounded-2xl bg-white p-8 shadow border border-zinc-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700" htmlFor="current">
                Mot de passe actuel
              </label>
              <input
                id="current"
                type="password"
                autoComplete="current-password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700" htmlFor="next">
                Nouveau mot de passe
              </label>
              <input
                id="next"
                type="password"
                autoComplete="new-password"
                required
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700" htmlFor="confirm">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {clientError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {clientError}
              </p>
            )}
            {serverError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {serverError}
              </p>
            )}
            {status === "success" && (
              <p className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                Mot de passe modifié avec succès.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "saving"}
              className="mt-2 self-start rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              {status === "saving" ? "Modification…" : "Modifier mon mot de passe"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
