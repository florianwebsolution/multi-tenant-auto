"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TokenStatus = "checking" | "valid" | "invalid" | "expired" | "used";
type SaveStatus = "idle" | "saving" | "success" | "error";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    setTokenStatus("valid");
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    setServerError(null);

    if (password.length < 8) {
      setClientError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setClientError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSaveStatus("saving");

    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword: confirm }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.redirect) {
          router.push("/backoffice/login");
          return;
        }
        if (res.status === 400 && data.error?.includes("expiré")) {
          setTokenStatus("expired");
        }
        setServerError(data.error ?? "Une erreur est survenue.");
        setSaveStatus("error");
        return;
      }

      setSaveStatus("success");
      setTimeout(() => router.push("/backoffice/login"), 1500);
    } catch {
      setServerError("Impossible de contacter le serveur.");
      setSaveStatus("error");
    }
  }

  if (tokenStatus === "checking") {
    return <Layout><p className="text-sm text-zinc-500">Vérification du lien…</p></Layout>;
  }

  if (tokenStatus === "invalid") {
    return (
      <Layout>
        <p className="text-sm text-red-600">Lien invalide ou manquant.</p>
      </Layout>
    );
  }

  if (tokenStatus === "expired") {
    return (
      <Layout>
        <p className="text-sm text-red-600">
          Ce lien a expiré. Contactez l&apos;administrateur pour en obtenir un nouveau.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-6 text-xl font-semibold text-zinc-800">
        Définir mon mot de passe
      </h1>

      {saveStatus === "success" ? (
        <p className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          Mot de passe défini. Redirection vers la connexion…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="confirm">
              Confirmer le mot de passe
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

          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="mt-2 self-start rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Enregistrement…" : "Définir mon mot de passe"}
          </button>
        </form>
      )}
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 font-sans">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow border border-zinc-200">
        {children}
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<Layout><p className="text-sm text-zinc-500">Chargement…</p></Layout>}>
      <SetupPasswordForm />
    </Suspense>
  );
}
