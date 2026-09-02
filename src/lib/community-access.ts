import { prisma } from "@/lib/prisma";

export async function findApprovedApplicationForUser(user: {
  id: string;
  email: string;
}) {
  return prisma.application.findFirst({
    where: {
      status: "APPROVED",
      OR: [
        { userId: user.id },
        {
          members: {
            some: {
              email: { equals: user.email, mode: "insensitive" },
            },
          },
        },
      ],
    },
    select: { id: true },
  });
}
