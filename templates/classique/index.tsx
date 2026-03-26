import { TenantData } from "@/lib/tenant";

export default function ClassiqueTemplate({ tenant }: { tenant: TenantData }) {
  const primary = tenant.colors?.primary ?? "#2563eb";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 font-sans">
      <main className="flex flex-col gap-5 rounded-xl bg-white p-12 shadow w-full max-w-md border border-zinc-200">
        <div
          className="self-start text-xs font-semibold uppercase tracking-widest"
          style={{ color: primary }}
        >
          Bienvenue
        </div>
        <h1
          className="text-3xl font-semibold"
          style={{ color: primary }}
        >
          {tenant.name}
        </h1>
        <hr className="border-zinc-200" />
        <div className="flex flex-col gap-2 text-zinc-600 text-sm">
          <p>{tenant.agence?.address}</p>
          <p>{tenant.agence?.phone}</p>
          {tenant.email && <p>{tenant.email}</p>}
        </div>
      </main>
    </div>
  );
}
