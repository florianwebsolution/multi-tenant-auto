import { headers } from "next/headers";
import { getTenantRaw } from "@/lib/tenant";
import BackofficeDashboard from "./BackofficeDashboard";

export default async function BackofficePage() {
  const headersList = await headers();
  const slug = headersList.get("x-tenant") ?? "";
  const raw = await getTenantRaw(slug);

  if (!raw) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Tenant introuvable.</p>
      </div>
    );
  }

  const { auth, ...tenant } = raw;
  const adminEmail = auth?.email ?? "";

  return <BackofficeDashboard tenant={tenant} adminEmail={adminEmail} />;
}
