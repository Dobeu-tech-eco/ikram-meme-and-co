import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="panel p-10">
        <h1 className="text-3xl font-black">{isAr ? "شكراً لك!" : "Thank you!"}</h1>
        <p className="mt-4 opacity-90">
          {isAr
            ? "تم استلام طلبك. تحقق من بريدك الإلكتروني للحصول على التأكيد."
            : "Your order is in. Check your email for the confirmation."}
        </p>
      </div>
    </main>
  );
}
