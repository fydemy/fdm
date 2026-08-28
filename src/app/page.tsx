import type { Metadata } from "next";
import { GlobeLandingPage } from "@/components/globe-landing-page";
import { HomePage } from "@/components/home-page";
import { USE_GLOBE_LANDING } from "@/lib/landing";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  if (USE_GLOBE_LANDING) {
    return <GlobeLandingPage />;
  }

  return <HomePage />;
}
