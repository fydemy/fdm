import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { TractionOrDieJoinButton } from "@/components/traction-or-die-join-button";

const programTimeline = [
  {
    week: 0,
    title: "100% refundable",
    goal: "If in a month, your app gets traction and the revenue above $20 generated, we will refund you 100% of the payment.",
  },
  {
    week: 1,
    title: "Exclusive group & update every day",
    goal: "Get free access to our community to get feedback and support from other founders.",
  },
  {
    week: 2,
    title: "MVP & Payment Integration",
    goal: "Build your app with our app builder tool for free.",
  },
  {
    week: 3,
    title: "Launch & Showcase",
    goal: "Launch your app and showcase it to the world. (Backed by us with 5M+ engagement records).",
  },
  {
    week: 4,
    title: "Failed?",
    goal: "If you fail (no traction, revenue below $20), no refund will be given and you will kick out of the group.",
  },
] as const;

export const metadata: Metadata = {
  title: "Traction or Die",
  description:
    "A focused program to ship traction fast — build distribution and execution discipline.",
  alternates: {
    canonical: "/traction-or-die",
  },
  openGraph: {
    title: "Traction or Die",
    description:
      "A focused program to ship traction fast, build distribution and execution discipline.",
    url: "/traction-or-die",
  },
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-16 px-6 py-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">
            Traction or Die 🚀
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            1 month sprint designed to force distribution, execution, and measurable traction. Claude Pro price lah.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <TractionOrDieJoinButton />
        </div>

        <section className="space-y-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            TnC
          </h2>

          <ol className="relative space-y-8">
            {programTimeline.map((item) => (
              <li key={item.week} className="relative">
                <div className="space-y-1 rounded-xl border bg-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    [{item.week}]
                  </p>
                  <h3 className="font-medium tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.goal}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}

