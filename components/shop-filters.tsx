import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FULFILLMENT_TYPES, type FulfillmentType } from "@/lib/product-merch";

type Props = {
  active: FulfillmentType | "all";
};

export function ShopFilters({ active }: Props) {
  const t = useTranslations("shop");

  const items: { key: FulfillmentType | "all"; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "original", label: t("filterOriginal") },
    { key: "edition", label: t("filterEdition") },
    { key: "pod", label: t("filterPod") },
  ];

  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label={t("filterAll")}>
      {items.map((item) => {
        const href =
          item.key === "all"
            ? "/shop"
            : (`/shop?type=${item.key}` as const);
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={href}
            className="chip"
            data-active={isActive ? "true" : "false"}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseShopType(
  value: string | string[] | undefined
): FulfillmentType | "all" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (FULFILLMENT_TYPES as readonly string[]).includes(raw)) {
    return raw as FulfillmentType;
  }
  return "all";
}
