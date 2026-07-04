import { Resend } from "resend";

const from = process.env.RESEND_FROM_EMAIL ?? "Fydemy <onboarding@resend.dev>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resend = getResend();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping send:", subject);
    return { id: "skipped" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] failed:", error);
    throw new Error(error.message);
  }

  return data;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f6f7f9; padding:32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${title}</h1>
        <div style="color:#374151;font-size:15px;line-height:1.6;">${body}</div>
        <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;">— Fydemy team</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function sendApplicationReceivedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Thanks for applying — ${input.productName}`,
    html: layout(
      "Thanks for applying!",
      `<p>Hi ${escapeHtml(input.applicantName)},</p>
       <p>We received your application for <strong>${escapeHtml(input.productName)}</strong>.</p>
       <p>Our reviewers will take a look and email you once a decision is made.</p>`,
    ),
  });
}

export async function sendApplicationApprovedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
  note?: string | null;
}) {
  const noteHtml = input.note
    ? `<p style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;"><strong>Note from reviewer:</strong> ${escapeHtml(input.note)}</p>`
    : "";

  return sendEmail({
    to: input.to,
    subject: `You're approved — ${input.productName}`,
    html: layout(
      "Application approved",
      `<p>Hi ${escapeHtml(input.applicantName)},</p>
       <p>Great news — your application for <strong>${escapeHtml(input.productName)}</strong> has been approved.</p>
       <p>You can now publish launches and access materials from your dashboard.</p>
       ${noteHtml}`,
    ),
  });
}

export async function sendApplicationRejectedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
  note?: string | null;
}) {
  const noteHtml = input.note
    ? `<p style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:8px;"><strong>Note from reviewer:</strong> ${escapeHtml(input.note)}</p>`
    : "";

  return sendEmail({
    to: input.to,
    subject: `Update on your application — ${input.productName}`,
    html: layout(
      "Application not approved",
      `<p>Hi ${escapeHtml(input.applicantName)},</p>
       <p>Thanks for applying with <strong>${escapeHtml(input.productName)}</strong>. After review, we are unable to approve this application at this time.</p>
       ${noteHtml}
       <p>You are welcome to apply again with an updated proposal.</p>`,
    ),
  });
}
