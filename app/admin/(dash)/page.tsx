import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-black">Dashboard</h2>
      <p className="opacity-80">
        Manage the catalog and fulfill orders. Start with{" "}
        <Link href="/admin/products" className="underline">
          Products
        </Link>{" "}
        or{" "}
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
        .
      </p>
    </div>
  );
}
