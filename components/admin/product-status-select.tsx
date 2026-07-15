"use client";
import { useState, useTransition } from "react";
import { updateProductStatus } from "@/lib/actions/products";

const OPTIONS = ["draft", "available", "archived"] as const;

export function ProductStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as (typeof OPTIONS)[number];
        setValue(next);
        start(async () => {
          await updateProductStatus(id, next);
        });
      }}
      className="rounded border px-2 py-1 text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
