import { pages } from "@/lib/content/pages";

export const dynamic = "force-static";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = pages.contact[locale === "ar" ? "ar" : "en"];
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <h1 className="text-3xl font-black">{c.title}</h1>
      <p className="mt-4 text-lg leading-relaxed opacity-80">{c.intro}</p>

      <div className="panel mt-10 p-6">
        <p className="text-sm font-bold uppercase tracking-wide opacity-60">
          {c.emailLabel}
        </p>
        <a
          href={`mailto:${c.email}`}
          className="mt-1 inline-block text-xl font-black text-[--color-accent]"
        >
          {c.email}
        </a>
        <p className="mt-4 leading-relaxed opacity-80">{c.responseNote}</p>
      </div>

      <p className="mt-8 text-sm opacity-60">{c.entityNote}</p>
    </main>
  );
}
