import { pages } from "@/lib/content/pages";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = pages.about[locale === "ar" ? "ar" : "en"];
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <h1 className="text-3xl font-black">{c.title}</h1>
      <p className="mt-4 text-lg leading-relaxed opacity-80">{c.intro}</p>
      <div className="mt-10 space-y-8">
        {c.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed opacity-80">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
