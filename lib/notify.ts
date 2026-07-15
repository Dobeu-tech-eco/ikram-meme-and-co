import "server-only";
import type { Notify } from "@/lib/stripe-events";
import { sendEmail } from "@/lib/resend";
import { orderConfirmation, adminOrderNotice } from "@/lib/email-templates";

export const notify: Notify = {
  async orderPaid(input) {
    if (input.email) await sendEmail({ to: input.email, ...orderConfirmation(input) });
    const admin = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
    if (admin) await sendEmail({ to: admin, ...adminOrderNotice(input) });
  },
};
