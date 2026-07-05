import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TRPCLayout from "@/components/provider/trpc";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/seo";
import { GoogleAnalytics } from "@/components/google-analytics";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Fydemy",
    "product launches",
    "startup community",
    "product builders",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/logo.svg",
        width: 697,
        height: 200,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/logo.svg"],
  },
  icons: {
    icon: [{ url: "/fav.svg", type: "image/svg+xml" }],
    apple: "/fav.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.className} ${jetbrainsMono.variable} tracking-tighter antialiased`}
      >
        <TooltipProvider>
          <TRPCLayout>
            {children}
            <Toaster />
          </TRPCLayout>
        </TooltipProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
