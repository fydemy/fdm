import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
  alternates: {
    canonical: "/home",
  },
};

export default function HomeRoute() {
  return <HomePage />;
}
