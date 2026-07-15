import { requireAdmin } from "@/lib/actions/auth";
import { ProductStatusSelect } from "@/components/admin/product-status-select";

export const dynamic = "force-dynamic";

type AdminProduct = {
  id: string;
  slug: string;
  title_en: string;
  price_cents: number;
  fulfillment_type: string;
  status: string;
  quantity: number;
};

export default async function AdminProductsPage() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("products")
    .select("id, slug, title_en, price_cents, fulfillment_type, status, quantity")
    .order("created_at", { ascending: false });
  const products = (data ?? []) as AdminProduct[];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-black">Products</h2>
      <table className="w-full text-sm">
        <thead className="text-start">
          <tr className="border-b">
            <th className="p-2 text-start">Title</th>
            <th className="p-2 text-start">Type</th>
            <th className="p-2 text-start">Price</th>
            <th className="p-2 text-start">Qty</th>
            <th className="p-2 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.title_en}</td>
              <td className="p-2">{p.fulfillment_type}</td>
              <td className="p-2">${(p.price_cents / 100).toFixed(0)}</td>
              <td className="p-2">{p.quantity}</td>
              <td className="p-2">
                <ProductStatusSelect id={p.id} status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p className="mt-4 opacity-70">No products yet.</p>}
    </div>
  );
}
