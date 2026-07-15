import { NewProductForm } from "@/components/admin/new-product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-black">New product</h2>
      <NewProductForm />
    </div>
  );
}
