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
  text: string;
};

async function sendEmail({ to, subject, text }: SendEmailInput) {
  const resend = getResend();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping send:", subject);
    return { id: "skipped" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  if (error) {
    console.error("[email] failed:", error);
    throw new Error(error.message);
  }

  return data;
}

function formatBody(lines: string[]) {
  return [...lines, "", "— Fydemy team"].join("\n");
}

export async function sendApplicationReceivedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Thanks for applying — ${input.productName}`,
    text: formatBody([
      "Thanks for applying!",
      "",
      `Hi ${input.applicantName},`,
      "",
      `We received your application for ${input.productName}.`,
      "",
      "Our reviewers will take a look and email you once a decision is made.",
    ]),
  });
}

export async function sendApplicationApprovedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
  note?: string | null;
}) {
  const lines = [
    "Application approved",
    "",
    `Hi ${input.applicantName},`,
    "",
    `Great news — your application for ${input.productName} has been approved.`,
    "",
    "You can now publish launches and access materials from your dashboard.",
  ];

  if (input.note) {
    lines.push("", `Note from reviewer: ${input.note}`);
  }

  return sendEmail({
    to: input.to,
    subject: `You're approved — ${input.productName}`,
    text: formatBody(lines),
  });
}

export async function sendApplicationRejectedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
  note?: string | null;
}) {
  const lines = [
    "Application not approved",
    "",
    `Hi ${input.applicantName},`,
    "",
    `Thanks for applying with ${input.productName}. After review, we are unable to approve this application at this time.`,
  ];

  if (input.note) {
    lines.push("", `Note from reviewer: ${input.note}`);
  }

  lines.push("", "You are welcome to apply again with an updated pitch deck.");

  return sendEmail({
    to: input.to,
    subject: `Update on your application — ${input.productName}`,
    text: formatBody(lines),
  });
}
