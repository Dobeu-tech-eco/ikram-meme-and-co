import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin, AuthError } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) redirect("/admin/login");
    throw err;
  }
  return (
    <div className="flex min-h-svh">
      <aside className="w-56 shrink-0 border-e p-6">
        <h1 className="mb-6 text-lg font-black">Admin</h1>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/products/new">New product</Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
