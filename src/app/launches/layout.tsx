import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launches",
  description:
    "Browse public product launches from the Fydemy community.",
  alternates: {
    canonical: "/launches",
  },
  openGraph: {
    title: "Launches",
    description:
      "Browse public product launches from the Fydemy community.",
    url: "/launches",
  },
};

export default function LaunchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
