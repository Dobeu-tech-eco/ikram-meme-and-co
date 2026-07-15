type OrderEmailInput = {
  email: string;
  locale: "en" | "ar";
  productTitle: string;
  amountCents: number;
};

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const shell = (dir: "rtl" | "ltr", body: string) => `<!doctype html>
<html dir="${dir}"><body style="font-family:sans-serif;background:#faf9f7;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;">${body}</div>
</body></html>`;

export function orderConfirmation(i: OrderEmailInput): { subject: string; html: string } {
  if (i.locale === "ar") {
    return {
      subject: `تأكيد طلبك — ${i.productTitle}`,
      html: shell(
        "rtl",
        `<h1>شكراً لك!</h1><p>تم تأكيد شرائك لقطعة <strong>${i.productTitle}</strong> بمبلغ ${usd(i.amountCents)}.</p><p>سنرسل لك رقم التتبع فور شحن القطعة.</p>`
      ),
    };
  }
  return {
    subject: `Order confirmed — ${i.productTitle}`,
    html: shell(
      "ltr",
      `<h1>Thank you!</h1><p>Your purchase of <strong>${i.productTitle}</strong> for ${usd(i.amountCents)} is confirmed.</p><p>We'll email tracking as soon as it ships.</p>`
    ),
  };
}

export function adminOrderNotice(i: OrderEmailInput): { subject: string; html: string } {
  return {
    subject: `New order: ${i.productTitle} (${usd(i.amountCents)})`,
    html: shell(
      "ltr",
      `<h1>New order</h1><p><strong>${i.productTitle}</strong> — ${usd(i.amountCents)}</p><p>Buyer: ${i.email}</p><p>Ship it, then mark fulfilled in /admin/orders.</p>`
    ),
  };
}
