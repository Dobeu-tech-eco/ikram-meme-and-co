"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribe } from "@/lib/actions/subscribe";
import { track } from "@/lib/analytics";

export function SubscribeForm() {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("footer");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    start(async () => {
      const r = await subscribe({ email, locale });
      if (r.ok) {
        setDone(true);
        track("email_subscribed", { locale });
      }
    });
  }

  return (
    <div className="glass p-6">
      <h3 className="mb-3 font-bold">{t("subscribe")}</h3>
      {done ? (
        <p className="text-sm font-bold text-[--color-accent]">{t("subscribed")}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="flex-1 rounded-[--radius-xl] border px-4 py-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-[--radius-xl] px-6 py-2 font-bold text-white disabled:opacity-50"
            style={{ background: "var(--color-accent)" }}
          >
            {pending ? "…" : "→"}
          </button>
        </form>
      )}
    </div>
  );
}
