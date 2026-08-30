import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import { addFounderToCommunity } from "@/lib/discord";
import { verifyCommunityClaim } from "@/lib/community-claim";

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return NextResponse.json({ needAuth: true }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const cookieStore = await cookies();
  const claimedUserId = verifyCommunityClaim(
    body.token || cookieStore.get("fdm_community_claim")?.value || "",
  );

  const approved = await prisma.application.findFirst({
    where: {
      status: "APPROVED",
      OR: [
        { userId: session.user.id },
        ...(claimedUserId ? [{ userId: claimedUserId }] : []),
      ],
    },
    select: { id: true },
  });

  const discord = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "discord" },
  });

  if (!discord?.accountId) {
    return NextResponse.json({ needDiscord: true });
  }

  if (!approved) {
    return NextResponse.json({ url: siteConfig.discordInviteUrl });
  }

  let accessToken = "";
  try {
    const tokens = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "discord" },
    });
    accessToken = tokens.accessToken ?? "";
  } catch (error) {
    console.error("[discord] getAccessToken failed", error);
  }

  const result = await addFounderToCommunity({
    discordUserId: discord.accountId,
    accessToken,
  });

  if (!result.ok && !accessToken) {
    return NextResponse.json({ needDiscord: true });
  }

  return NextResponse.json({ url: result.url });
}
