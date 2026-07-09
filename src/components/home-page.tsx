"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { LaunchCard } from "@/components/launch-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";

const programTimeline = [
  {
    week: 0,
    title: "English from the start",
    goal: "All communication in English, no exceptions.",
  },
  {
    week: 1,
    title: "Validation",
    goal: "Validate your idea or current product with experts before go further.",
  },
  {
    week: 2,
    title: "Code review & optimization",
    goal: "Review your code with experts and optimize it for performance and scalability.",
  },
  {
    week: 3,
    title: "Optimize your pitch deck & launch showcase",
    goal: "Align your pitch deck & showcase with VC standards.",
  },
  {
    week: 4,
    title: "Global Launch & Pipeline Injection",
    goal: "Launch your product backed by us with 5M+ engagement records and continuous ads support as alumni",
  },
] as const;

export function HomePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: featured, isLoading } = trpc.launch.listFeatured.useQuery();
  const hasSession = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex min-h-dvh flex-col">
        <PublicSiteHeader />

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center space-y-10 px-6 py-12 text-center">
          <div className="max-w-lg space-y-3">
            <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">
              Build what they can't live without.
            </h1>
            <p className="text-lg text-muted-foreground">
              1 mo. acc. Make it VC-standard products.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() =>
                hasSession
                  ? router.push("/dashboard")
                  : authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
              }
              className="rounded-full px-12 py-6"
            >
              {hasSession ? "Dashboard" : "Apply"} <ArrowRight />
            </Button>
            <Link
              href="/traction-or-die"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className: "rounded-full px-12 py-6",
                }),
              )}
            >
             🚀 Traction or Die
            </Link>
            <Link
              href={siteConfig.discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "secondary", className: "rounded-full px-12 py-6" }))}
            >
              <Users /> Community
            </Link>
          </div>
          <div>
            <h2 className="text-sm text-muted-foreground">Our Alumni</h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
              <img
                src="/logo/nus.png"
                alt="NUS"
                className="h-24 w-auto"
              />
              <img
                src="/logo/ntu.png"
                alt="NTU"
                className="h-30 w-auto"
              />
              <img
                src="/logo/ui.webp"
                alt="UI"
                className="h-14 w-auto"
              />
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-24 px-6 py-20">
       <section className="space-y-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Featured
        </h2>
        {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          )}

          {!isLoading && (featured ?? []).length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No featured launches yet. Check back soon, or browse all launches.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {(featured ?? []).map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
       </section>

        <section className="space-y-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              We're doing it in 4 steps.
          </h2>

          <ol className="relative space-y-8">
            {programTimeline.map((item) => (
              <li key={item.week} className="relative">
                <div className="space-y-1 rounded-xl border bg-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    [{item.week}]
                  </p>
                  <h3 className="font-medium tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.goal}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            FAQ
          </h2>
          <Accordion>
            <AccordionItem value="vc-funding">
              <AccordionTrigger>
                Does this program guarantee VC funding after 30 days?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  No, we don&apos;t guarantee funding. Getting funded depends
                  100% on your product&apos;s traction and execution.
                </p>
                <p>
                  What we guarantee is VC-Readiness. We take your raw code and
                  spend 30 days wrapping it into global standards—giving you
                  high-end demo videos, global launch assets, and a professional
                  pitch deck. We are currently building and expanding our
                  network of regional VC partners to put your products in front
                  of them once you are ready.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upfront-fee">
              <AccordionTrigger>
                Is there any upfront fee or hidden cash cost to join?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  No. We charge zero cash from student builders. We know you
                  need every single rupiah or dollar to focus on your product.
                  Instead, we operate on a Sweat Equity model.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sweat-equity">
              <AccordionTrigger>
                What is Sweat Equity and how does it work here?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  Sweat Equity means we invest our resources, premium AI
                  inference credits, production crew (for your Apple-style demo
                  videos), curated hacker spaces, and investor pipeline in
                  exchange for a small, future ownership stake in your project.
                  We only take a standard 1% advisory equity via a SAFE
                  (Simple Agreement for Future Equity) framework.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safe-no-entity">
              <AccordionTrigger>
                My project is not a legal entity (PT/Pte Ltd) yet. How can we
                sign an equity agreement?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  That is exactly what the SAFE framework is for. It is a
                  Silicon Valley standard (pioneered by Y Combinator). By signing
                  the SAFE on Day 1, you don&apos;t need to spin up a company
                  right now. It simply states that if and when your project
                  incorporates into a legal entity or receives its first
                  institutional funding in the future, our 1% stake will
                  automatically vest.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pivot">
              <AccordionTrigger>
                1% sounds small, but what if we pivot or change our product
                later?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  We invest in you (the builders), not just the initial code.
                  If your team decides to pivot to a better architecture or a
                  new product during or after the 1-month cohort, the 1% SAFE
                  simply carries over to the new entity built by the same
                  founding team.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="project-fails">
              <AccordionTrigger>
                What happens if our project fails after the 1-month sprint?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  If the project goes sideways and stops, the SAFE becomes void.
                  You owe us nothing. We take the risk together with you from
                  day zero. We win when you win, and we lose when you lose.
                  That&apos;s what having skin in the game means.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="elite-builder">
              <AccordionTrigger>
                I don&apos;t have a product, but I am an elite developer looking
                for a team. Can I join?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  Yes, through our Community Talent Pool. While you cannot apply
                  as a startup founder without an MVP, you can register as an
                  &quot;Elite Builder&quot; in our tech ecosystem. We often
                  match solo geniuses with existing teams in our cohort who need
                  heavy infrastructure, Rust/Go, or Agentic AI expertise.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
