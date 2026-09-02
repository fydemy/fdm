import { prisma } from "@/lib/prisma";

type ApplicationUser = {
  id: string;
  email: string;
};

function memberEmailMatch(user: ApplicationUser) {
  return {
    members: {
      some: {
        email: { equals: user.email, mode: "insensitive" as const },
      },
    },
  };
}

export function applicationAccessWhere(user: ApplicationUser) {
  return {
    OR: [{ userId: user.id }, memberEmailMatch(user)],
  };
}

export function approvedApplicationAccessWhere(user: ApplicationUser) {
  return {
    status: "APPROVED" as const,
    OR: [{ userId: user.id }, memberEmailMatch(user)],
  };
}

export async function findApprovedApplicationForUser(user: ApplicationUser) {
  return prisma.application.findFirst({
    where: approvedApplicationAccessWhere(user),
    select: { id: true },
  });
}

export async function findApplicationsForUser(user: ApplicationUser) {
  return prisma.application.findMany({
    where: applicationAccessWhere(user),
    include: { members: true },
    orderBy: { createdAt: "desc" },
  });
}
