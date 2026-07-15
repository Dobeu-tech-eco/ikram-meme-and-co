import "server-only";
import { Resend } from "resend";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Ikram & Co. <orders@updates.dobeu.store>",
      ...opts,
    });
  } catch (err) {
    console.error("resend send failed (non-fatal)", err);
  }
}
