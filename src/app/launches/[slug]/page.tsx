import type { Metadata } from "next";
import { PublicLaunchPage } from "@/components/public-launch-page";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function plainText(value: string, maxLength = 160) {
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const launch = await prisma.launch.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      application: { status: "APPROVED" },
    },
    select: {
      title: true,
      slug: true,
      content: true,
      application: {
        select: { name: true, description: true, logoUrl: true },
      },
    },
  });

  if (!launch) {
    return {
      title: "Launch not found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    plainText(launch.application.description || launch.content) ||
    `${launch.title} by ${launch.application.name} on ${siteConfig.name}`;
  const logoUrl = launch.application.logoUrl ?? undefined;
  const image = logoUrl
    ? { url: logoUrl, alt: launch.application.name }
    : undefined;

  return {
    title: launch.title,
    description,
    alternates: {
      canonical: `/launches/${launch.slug}`,
    },
    icons: logoUrl
      ? {
          icon: [{ url: logoUrl }],
          apple: logoUrl,
        }
      : undefined,
    openGraph: {
      type: "article",
      title: launch.title,
      description,
      url: `/launches/${launch.slug}`,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      title: launch.title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PublicLaunchPage slug={slug} />;
}
