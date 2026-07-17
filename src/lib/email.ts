import { Resend } from "resend";
import { siteConfig } from "@/lib/seo";

const from = process.env.RESEND_FROM_EMAIL ?? "Fydemy <onboarding@resend.dev>";
const cc = process.env.RESEND_CC_EMAIL?.trim() || undefined;

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
    ...(cc ? { cc } : {}),
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
  return [...lines, "", "Warm regards,", "The Fydemy Team"].join("\n");
}

export async function sendApplicationReceivedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Thanks for applying to Fydemy, ${input.productName}`,
    text: formatBody([
      "Thanks for applying to Fydemy!",
      "",
      `Hi ${input.applicantName},`,
      "",
      `We've received your application for ${input.productName}, and our team is excited to take a closer look. Our reviewers will go through your submission carefully and email you as soon as a decision has been made.`,
      "",
      "In the meantime, come join our Discord community and introduce yourself. It's the best place to meet other founders, ask questions, and get a feel for what we're building together:",
      siteConfig.discordInviteUrl,
      "",
      "If any questions come up along the way, just reply to this email or reach out to us on Discord. We're glad to have you here.",
    ]),
  });
}

export async function sendApplicationApprovedEmail(input: {
  to: string[];
  productName: string;
  applicantName: string;
  note?: string | null;
}) {
  const depositUrl = `${siteConfig.url}/dashboard/apply`;

  const lines = [
    "Congratulations, your application has been approved!",
    "",
    `Hi ${input.applicantName},`,
    "",
    `We're thrilled to let you know that your application for ${input.productName} has been approved. Welcome to the Fydemy batch! We can't wait to see what you build over the coming weeks.`,
    "",
    "To confirm your spot in the batch, we ask for a deposit of Rp 3,010,000. Rp 3,000,000 of that amount is fully refundable, and Rp 10,000 covers a one-time, non-refundable transfer fee.",
    "",
    "Head to your dashboard to complete the deposit. You'll see the QRIS to scan and a field to submit your transaction ID:",
    depositUrl,
    "",
    "Once your deposit is in, you can publish launches and access program materials. If you haven't already, join us on Discord and say hello so we can get you plugged into the community:",
    siteConfig.discordInviteUrl,
  ];

  if (input.note) {
    lines.push("", `A note from your reviewer: ${input.note}`);
  }

  return sendEmail({
    to: input.to,
    subject: `You're approved! Welcome to Fydemy, ${input.productName}`,
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
    "An update on your Fydemy application",
    "",
    `Hi ${input.applicantName},`,
    "",
    `Thank you for taking the time to apply with ${input.productName}. After careful review, we're not able to move forward with your application at this time. Please know this was a difficult decision, and it doesn't take away from the effort you clearly put in.`,
  ];

  if (input.note) {
    lines.push("", `A note from your reviewer: ${input.note}`);
  }

  lines.push(
    "",
    "We'd genuinely welcome a future application with an updated pitch deck. In the meantime, we'd love for you to stay part of our Discord community, where you can keep learning and connecting with other builders:",
    siteConfig.discordInviteUrl,
  );

  return sendEmail({
    to: input.to,
    subject: `An update on your application for ${input.productName}`,
    text: formatBody(lines),
  });
}
