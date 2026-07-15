import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden">
      {/* layered gradient mesh — the immersive signature moment */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute -top-1/4 start-[-10%] h-[70svh] w-[70svh] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-20%] end-[-10%] h-[80svh] w-[80svh] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-accent-2), transparent 70%)" }}
        />
      </div>
      <div className="glass max-w-3xl mx-4 p-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-black leading-tight text-balance">{t("title")}</h1>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-[--radius-xl] px-8 py-4 font-bold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
