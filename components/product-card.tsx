import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ProductRow } from "@/lib/catalog";

const tint: Record<string, string> = {
  original:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 50%, transparent), color-mix(in oklab, var(--color-accent-2) 40%, transparent))",
  edition:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent-2) 50%, transparent), color-mix(in oklab, var(--color-accent) 30%, transparent))",
  pod: "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 35%, transparent), color-mix(in oklab, var(--color-surface-2) 60%, transparent))",
};

export function ProductCard({ p }: { p: ProductRow }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const sold = p.status === "sold" || (p.fulfillment_type === "edition" && p.quantity < 1);
  return (
    <Link
      href={`/product/${p.slug}`}
      className="glass group block overflow-hidden transition duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-[--color-surface-2]">
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{ background: tint[p.fulfillment_type] ?? tint.original }}
        />
        {p.fulfillment_type === "original" && !sold && (
          <span className="absolute end-3 top-3 rounded-full bg-[--color-fg] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[--color-surface]">
            1 / 1
          </span>
        )}
        {sold && (
          <span className="absolute end-3 top-3 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white" style={{ background: "var(--color-accent)" }}>
            {t("sold")}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display truncate font-bold">
          {locale === "ar" ? p.title_ar : p.title_en}
        </h3>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-display text-lg font-extrabold text-[--color-accent]">
            ${(p.price_cents / 100).toFixed(0)}
          </span>
          <span className="text-xs uppercase tracking-wider opacity-50">
            {p.fulfillment_type === "original"
              ? "Original"
              : p.fulfillment_type === "edition"
                ? "Edition"
                : "Print"}
          </span>
        </div>
      </div>
    </Link>
  );
}
