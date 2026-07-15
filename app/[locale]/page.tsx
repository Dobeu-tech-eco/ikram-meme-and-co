import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");
  return <h1 className="p-8 text-3xl font-bold">{t("title")}</h1>;
}
