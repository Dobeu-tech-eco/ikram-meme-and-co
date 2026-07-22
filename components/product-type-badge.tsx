import { useTranslations } from "next-intl";
import {
  getScarcityInfo,
  isFulfillmentType,
  type MerchProduct,
} from "@/lib/product-merch";

export function ProductTypeBadge({ p }: { p: MerchProduct }) {
  const t = useTranslations("product");
  const type = isFulfillmentType(p.fulfillment_type) ? p.fulfillment_type : null;
  if (!type) return null;

  const typeLabel =
    type === "original"
      ? t("typeOriginal")
      : type === "edition"
        ? t("typeEdition")
        : t("typePod");

  return <span className="badge-type">{typeLabel}</span>;
}

export function ProductScarcity({ p }: { p: MerchProduct }) {
  const t = useTranslations("product");
  const info = getScarcityInfo(p);

  switch (info.kind) {
    case "sold":
      return <span className="text-xs font-semibold tracking-wide text-[--color-accent]">{t("sold")}</span>;
    case "oneOfOne":
      return <span className="text-xs text-[--color-muted]">{t("oneOfOne")}</span>;
    case "editionLeft":
      return (
        <span className="text-xs text-[--color-muted]">
          {t("editionLeft", { count: info.quantity ?? 0 })}
        </span>
      );
    case "madeToOrder":
      return <span className="text-xs text-[--color-muted]">{t("madeToOrder")}</span>;
    default: {
      const _exhaustive: never = info.kind;
      return _exhaustive;
    }
  }
}
