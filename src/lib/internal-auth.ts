import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time comparison. `timingSafeEqual` throws on mismatched lengths, so
 * an unequal length short-circuits — after burning an equivalent comparison,
 * so the timing of a wrong-length token matches a wrong-value one.
 */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export type InternalAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

/**
 * Guards the internal API the discord-bot-gateway calls. Fails closed: with no
 * GATEWAY_TOKEN configured the route answers 503 rather than accepting
 * anything, which mirrors the gateway's own middleware.
 */
export function checkInternalAuth(authorization: string | null): InternalAuthResult {
  const expected = process.env.GATEWAY_TOKEN?.trim();
  if (!expected) {
    return { ok: false, status: 503, error: "gateway_token_unset" };
  }

  const presented = /^Bearer (.+)$/.exec(authorization ?? "")?.[1];
  if (!presented || !safeEqual(presented, expected)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return { ok: true };
}
