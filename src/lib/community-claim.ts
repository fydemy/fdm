import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90;

function secret() {
  return process.env.BETTER_AUTH_SECRET ?? "";
}

export function signCommunityClaim(userId: string) {
  const issuedAt = Date.now().toString();
  const payload = `${userId}.${issuedAt}`;
  const hmac = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${hmac}`).toString("base64url");
}

export function verifyCommunityClaim(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = decoded.slice(0, lastDot);
    const hmac = decoded.slice(lastDot + 1);
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    const a = Buffer.from(hmac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const [userId, issuedAt] = payload.split(".");
    if (!userId || !issuedAt) return null;
    if (Date.now() - Number(issuedAt) > MAX_AGE_MS) return null;
    return userId;
  } catch {
    return null;
  }
}
