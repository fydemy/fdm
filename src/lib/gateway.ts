/**
 * Typed client for discord-bot-gateway.
 *
 * Everything Discord-bot-shaped moved out of this app: the bot token, the
 * guild id, role and channel ids, the roadmap schedule and the reminder run
 * all live in that service now. fdm keeps Discord OAuth and nothing else.
 *
 * The gateway is internal-only — it has no public hostname — so this base url
 * is a service name on fydemy-internal, not a domain.
 */
const baseUrl = () => (process.env.GATEWAY_BASE_URL || "http://gateway:8080").replace(/\/+$/, "");

function token() {
  return process.env.GATEWAY_TOKEN?.trim() ?? "";
}

export type FounderRoleResult = { ok: boolean; url: string };

async function gatewayFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token()}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${baseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

/**
 * Joins the founder to the guild (when an OAuth access token is supplied) and
 * assigns the Founder role. Returns the url the browser should be sent to
 * either way — a founder should reach the community even when the role did
 * not stick.
 *
 * `fallbackUrl` is used when the gateway itself is unreachable, so a gateway
 * outage degrades to the public invite link rather than a 500.
 */
export async function assignFounderRole(input: {
  discordUserId: string;
  accessToken?: string;
  fallbackUrl: string;
}): Promise<FounderRoleResult> {
  if (!token()) {
    console.error("[gateway] GATEWAY_TOKEN is not set");
    return { ok: false, url: input.fallbackUrl };
  }

  try {
    const res = await gatewayFetch(
      `/members/${encodeURIComponent(input.discordUserId)}/founder-role`,
      {
        method: "POST",
        body: JSON.stringify(
          input.accessToken ? { accessToken: input.accessToken } : {},
        ),
      },
    );

    if (!res.ok) {
      console.error("[gateway] founder-role failed", res.status, await res.text());
      return { ok: false, url: input.fallbackUrl };
    }

    return (await res.json()) as FounderRoleResult;
  } catch (error) {
    console.error("[gateway] unreachable", error);
    return { ok: false, url: input.fallbackUrl };
  }
}
