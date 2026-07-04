import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
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
  },
};

export default function Page() {
  return <HomePage />;
}
