import { pages } from "@/lib/content/pages";

export const dynamic = "force-static";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = pages.faq[locale === "ar" ? "ar" : "en"];
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <h1 className="text-3xl font-black">{c.title}</h1>
      <p className="mt-4 text-lg leading-relaxed opacity-80">{c.intro}</p>
      <div className="mt-10">
        {c.items.map((item) => (
          <details key={item.q} className="glass p-4 mt-3">
            <summary className="font-bold cursor-pointer">{item.q}</summary>
            <p className="mt-2 opacity-80 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
