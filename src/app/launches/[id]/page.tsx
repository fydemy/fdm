import type { Metadata } from "next";
import { PublicLaunchPage } from "@/components/public-launch-page";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
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
  const { id } = await params;
  const launch = await prisma.launch.findFirst({
    where: { id, application: { status: "APPROVED" } },
    select: {
      title: true,
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
      canonical: `/launches/${id}`,
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
      url: `/launches/${id}`,
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
  const { id } = await params;
  return <PublicLaunchPage id={id} />;
}
