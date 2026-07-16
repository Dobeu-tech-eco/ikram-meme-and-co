import { legal } from "@/lib/content/legal";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const p = legal.privacy[locale === "ar" ? "ar" : "en"];
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <h1 className="text-3xl font-black">{p.title}</h1>
      <p className="mt-2 text-sm opacity-60">{p.updated}</p>
      <p className="mt-6 opacity-80 leading-relaxed">{p.intro}</p>
      {p.sections.map((s, i) => (
        <section key={i} className="mt-8">
          <h2 className="text-xl font-bold">{s.heading}</h2>
          {s.body.map((para, j) => (
            <p key={j} className="mt-3 opacity-80 leading-relaxed">
              {para}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}
