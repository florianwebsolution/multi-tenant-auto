import { headers } from "next/headers";
import { getTenant } from "@/lib/tenant";
import ModerneTemplate from "@/templates/moderne";
import ClassiqueTemplate from "@/templates/classique";

const TEMPLATES = {
  moderne: ModerneTemplate,
  classique: ClassiqueTemplate,
} as const;

type TemplateName = keyof typeof TEMPLATES;

export default async function Home() {
  const headersList = await headers();
  const slug = headersList.get("x-tenant");

  const tenant = slug ? await getTenant(slug) : null;

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-2xl font-semibold text-zinc-500">Site introuvable</p>
      </div>
    );
  }

  const templateKey = (tenant.template as TemplateName) in TEMPLATES
    ? (tenant.template as TemplateName)
    : "moderne";

  const Template = TEMPLATES[templateKey];

  return <Template tenant={tenant} />;
}
