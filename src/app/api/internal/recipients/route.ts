import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkInternalAuth } from "@/lib/internal-auth";

// Reads the database per request; there is nothing to prerender.
export const dynamic = "force-dynamic";

/**
 * Every approved founder's email, for the gateway's roadmap reminder run.
 *
 * This one call is the entire reason the two services talk. `batch` and
 * `reminder_log` live in the gateway's own database with no foreign keys into
 * these tables, so an HTTP hop here replaces what would otherwise be a second
 * Prisma schema pointed at this database.
 *
 * Internal only: it is reachable from fydemy-internal, never through Traefik
 * with a public hostname, and it requires the shared bearer token.
 */
export async function GET() {
  const auth = checkInternalAuth((await headers()).get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const applications = await prisma.application.findMany({
    where: { status: "APPROVED" },
    select: { user: { select: { email: true } } },
  });

  const recipients = [
    ...new Set(
      applications
        .map((application) => application.user.email)
        .filter((email): email is string => Boolean(email)),
    ),
  ];

  return NextResponse.json({ recipients });
}
