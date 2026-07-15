import { requireAdmin } from "@/lib/actions/auth";
import { OrderFulfillForm } from "@/components/admin/order-fulfill-form";

export const dynamic = "force-dynamic";

type AdminOrder = {
  id: string;
  email: string;
  status: string;
  amount_total_cents: number;
  tracking_number: string | null;
  created_at: string;
};

export default async function AdminOrdersPage() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("orders")
    .select("id, email, status, amount_total_cents, tracking_number, created_at")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as AdminOrder[];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-black">Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-start">Buyer</th>
            <th className="p-2 text-start">Total</th>
            <th className="p-2 text-start">Status</th>
            <th className="p-2 text-start">Fulfill</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b align-top">
              <td className="p-2">{o.email}</td>
              <td className="p-2">${(o.amount_total_cents / 100).toFixed(2)}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">
                {o.status === "fulfilled" ? (
                  <span className="opacity-70">{o.tracking_number}</span>
                ) : (
                  <OrderFulfillForm id={o.id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 opacity-70">No orders yet.</p>}
    </div>
  );
}
