"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

// Localized route error boundary. Copy is kept in plain English for now;
// localizing these strings via next-intl is a follow-up.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <div className="glass p-10 text-center">
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="mt-4 text-lg leading-relaxed opacity-80">
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-[--radius-xl] px-8 py-4 font-bold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            Try again
          </button>
          <Link href="/" className="rounded-[--radius-xl] px-8 py-4 font-bold underline">
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-sm opacity-50">Ref: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
