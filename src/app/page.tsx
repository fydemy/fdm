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
        url: "/logo/fav.jpeg",
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/logo/fav.jpeg"],
  },
};

export default function Page() {
  if (USE_GLOBE_LANDING) {
    return <GlobeLandingPage />;
  }

  return <HomePage />;
}
