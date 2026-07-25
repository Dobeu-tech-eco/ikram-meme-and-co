import { Link } from "@/i18n/navigation";

// Localized 404 page. Copy is kept in plain English for now; localizing
// these strings via next-intl is a follow-up.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      <div className="glass p-10 text-center">
        <h1 className="text-3xl font-black">404 — Page not found</h1>
        <p className="mt-4 text-lg leading-relaxed opacity-80">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-[--radius-xl] px-8 py-4 font-bold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
