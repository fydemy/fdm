import { prisma } from "../src/lib/prisma";
import { uniqueLaunchSlug } from "../src/lib/slug";

async function main() {
  const launches = await prisma.launch.findMany({
    select: { id: true, title: true, slug: true },
  });

  for (const launch of launches) {
    if (launch.slug) continue;
    const slug = await uniqueLaunchSlug(launch.title, launch.id);
    await prisma.launch.update({
      where: { id: launch.id },
      data: { slug },
    });
    console.log(`${launch.id} -> ${slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
