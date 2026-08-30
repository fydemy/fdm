import { siteConfig } from "@/lib/seo";

const DISCORD_API = "https://discord.com/api/v10";

type DiscordRole = { id: string; name: string; position: number };
type DiscordUser = { id: string };
type DiscordMember = { roles: string[]; user?: DiscordUser };

function botToken() {
  return process.env.DISCORD_BOT_TOKEN?.trim() ?? "";
}

function guildId() {
  return process.env.DISCORD_GUILD_ID?.trim() ?? "";
}

export function isDiscordConfigured() {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET &&
      botToken() &&
      guildId(),
  );
}

export function communityRedirectUrl() {
  const id = guildId();
  if (id) return `https://discord.com/channels/${id}`;
  return siteConfig.discordInviteUrl;
}

async function discordFetch(
  path: string,
  init: RequestInit & { bot?: boolean } = {},
) {
  const { bot, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Authorization", `Bot ${botToken()}`);
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${DISCORD_API}${path}`, { ...rest, headers });
}

async function founderRoleId() {
  if (process.env.DISCORD_FOUNDER_ROLE_ID) {
    return process.env.DISCORD_FOUNDER_ROLE_ID.trim();
  }

  const res = await discordFetch(`/guilds/${guildId()}/roles`, { bot: true });
  if (!res.ok) {
    console.error("[discord] list roles failed", res.status, await res.text());
    return null;
  }
  const roles = (await res.json()) as DiscordRole[];
  return roles.find((role) => role.name.toLowerCase() === "founder")?.id ?? null;
}

export async function addFounderToCommunity(input: {
  discordUserId: string;
  accessToken?: string;
}) {
  if (!isDiscordConfigured()) {
    console.error("[discord] missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID");
    return { ok: false as const, url: siteConfig.discordInviteUrl };
  }

  if (input.accessToken) {
    const join = await discordFetch(
      `/guilds/${guildId()}/members/${input.discordUserId}`,
      {
        method: "PUT",
        bot: true,
        body: JSON.stringify({ access_token: input.accessToken }),
      },
    );

    if (!join.ok) {
      const body = await join.text();
      console.error("[discord] guild join failed", join.status, body);
    }
  }

  const roleId = await founderRoleId();
  if (!roleId) {
    console.error('[discord] role "Founder" not found — set DISCORD_FOUNDER_ROLE_ID');
    return { ok: false as const, url: communityRedirectUrl() };
  }

  const role = await discordFetch(
    `/guilds/${guildId()}/members/${input.discordUserId}/roles/${roleId}`,
    {
      method: "PUT",
      bot: true,
      body: JSON.stringify({}),
    },
  );

  if (!role.ok) {
    const body = await role.text();
    console.error("[discord] role assign failed", role.status, body);
    await logRoleAccessHint(roleId);
    return { ok: false as const, url: communityRedirectUrl() };
  }

  return { ok: true as const, url: communityRedirectUrl() };
}

async function logRoleAccessHint(founderRoleId: string) {
  const me = await discordFetch("/users/@me");
  if (!me.ok) {
    console.error("[discord] bot token cannot call /users/@me", me.status);
    return;
  }
  const bot = (await me.json()) as DiscordUser;

  const member = await discordFetch(`/guilds/${guildId()}/members/${bot.id}`);
  if (member.status === 404) {
    console.error(
      `[discord] bot ${bot.id} is not in guild ${guildId()}. Invite with Bot scope + Manage Roles: https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot&permissions=268435456`,
    );
    return;
  }
  if (!member.ok) {
    console.error("[discord] cannot read bot member", member.status, await member.text());
    return;
  }

  const rolesRes = await discordFetch(`/guilds/${guildId()}/roles`);
  if (!rolesRes.ok) return;
  const roles = (await rolesRes.json()) as DiscordRole[];
  const founder = roles.find((r) => r.id === founderRoleId);
  const botMember = (await member.json()) as DiscordMember;
  const botHighest =
    roles
      .filter((r) => botMember.roles.includes(r.id))
      .sort((a, b) => b.position - a.position)[0]?.position ?? 0;

  if (!founder) {
    console.error("[discord] Founder role id is not in this guild");
    return;
  }
  if (founder.position >= botHighest) {
    console.error(
      `[discord] Founder role "${founder.name}" (position ${founder.position}) is above or equal to the bot's highest role (${botHighest}). In Server Settings → Roles, drag the bot's role above Founder.`,
    );
  }
}
