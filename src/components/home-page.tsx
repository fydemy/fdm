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
import { ArrowRight, Code2 } from "lucide-react";

const testimonials = [
  {
    name: "Nabila Rahmadani",
    image: "/profile/nabila.png",
    role: "100K+ followers, Founder @CariKOL (formerly Buzzeryok)",
    quote:
      "Thanks so much for the full guide in the PPT; it answered several questions I had about the build that I’d been struggling with since yesterday 😭.",
  },
  {
    name: "Anirudh Mannattil",
    image: "/profile/anirudh.png",
    role: "REP Student @NTU, CEO @CarbonCredible",
    quote:
      "We met all of the mentors over the past two weeks, and gained several valuable insights. Dennis and Oki posted about our sessions as well - thank you so much to both of you, and to Joenathan and Wahyu for meeting with us and supporting us!",
  },
] as const;

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

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center space-y-10 px-6 py-33 text-center">
          <div className="max-w-lg space-y-3">
            <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">
              Build what they can't live without.
            </h1>
            <p className="text-lg text-muted-foreground">
              Don't build alone. 😭
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() =>
                hasSession
                  ? router.push("/dashboard/apply")
                  : authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard/apply",
                  })
              }
              className="rounded-full px-12 py-6"
            >
              {hasSession ? "Dashboard" : "Apply"} <ArrowRight />
            </Button>
            <Link
              href={siteConfig.discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "secondary",
                className: "rounded-full! px-12 py-6",
              })}
            >
              Join Community
            </Link>
          </div>
          <div>
            <h2 className="text-sm text-muted-foreground">Our Alumni</h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8">
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

          <div className="w-full space-y-16 text-left mt-24">
            <h2 className="text-2xl font-semibold tracking-tight">⤵️ What Founders say?</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-2xl border bg-card py-4 text-left shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="font-semibold leading-none">
                          {testimonial.name}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">
                    {testimonial.quote}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-24 px-6 pb-20">
        <section className="space-y-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">📦 Pricing</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-6 rounded-xl border border-dashed py-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Ship fast & robust
                </h3>
                <p className="flex flex-wrap items-baseline gap-2 text-3xl font-semibold tracking-tight">
                  <span className="text-xl font-normal text-muted-foreground line-through">
                    $100
                  </span>
                  $50
                  <span className="text-sm font-normal text-muted-foreground">
                    50% off
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Trim your ship process from <b>weeks to minutes</b>.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Used by Software Engineers @TikTok, PayPal, those who understand fundamentals and 3+ years of experience</li>
                <li>Includes global payment gateway, automate boring stuff (SEO, Backend, etc)</li>
                <li>Lifetime updates</li>
                <li>Priority support</li>
              </ul>
              <Link href="https://buy.polar.sh/polar_cl_1Q65p8mRHXOe9DnEplslNeYqof5pDPfyBFj980gwyJj" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", className: "mt-auto w-fit rounded-full" })}>
                <Code2 /> Get now 
              </Link>
            </div>
            <div className="flex flex-col gap-6 rounded-xl border py-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  High-Growth Builders
                </h3>
                <p className="flex flex-wrap items-baseline gap-2 text-3xl font-semibold tracking-tight">
                  <span className="text-xl font-normal text-muted-foreground line-through">
                    $150
                  </span>
                  $75
                  <span className="text-sm font-normal text-muted-foreground">
                    50% off
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Get the <b>preasure</b> of shipping from alumni and mentors.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Get the Ship fast & robust benefits</li>
                <li>Ship and get traction or kick out from an exclusive community after 1 month</li>
                <li>Gamified 1 month roadmap calendar journey</li>
                <li>Get 1 month of AI resources for development</li>
                <li>Increase acceptance rate of the Serious Founders program</li>
              </ul>
              <Link href="https://buy.polar.sh/polar_cl_9TTcukj3Owi05kuQAfl0fGrIoSjGZTBzjQP9r4LLrK7" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", className: "mt-auto w-fit rounded-full" })}>
                Join now <ArrowRight />
              </Link>
            </div>

            <div className="flex flex-col gap-6 rounded-xl border py-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Serious Founders
                </h3>
                <p className="flex flex-wrap items-baseline gap-2 text-3xl font-semibold tracking-tight">
                  {siteConfig.batchDepositRequired ? (
                    <>
                      <span className="text-xl font-normal text-muted-foreground line-through">
                        $300
                      </span>
                      $150
                      <span className="text-sm font-normal text-muted-foreground">
                        50% off · Upon acceptance
                      </span>
                    </>
                  ) : (
                    "Free"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Get real 1-on-1 mentoring from <b>VC-backed Founders</b>.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Get all the benefits of High-Growth Builders</li>
                <li>1-on-1 mentoring sessions</li>
                <li>Exclusive exchange program to access builders from MIT, Stanford, Harvard, and other top universities founders</li>
                <li>Investor and partner access matchmaking</li>
                <li>Lifetime access as alumni</li>
              </ul>
              <Button
                className="mt-auto w-fit rounded-full"
                onClick={() =>
                  hasSession
                    ? router.push("/dashboard/apply")
                    : authClient.signIn.social({
                        provider: "google",
                        callbackURL: "/dashboard/apply",
                      })
                }
              >
                {hasSession ? "Dashboard" : "Apply"} <ArrowRight />
              </Button>
            </div>

          </div>
        </section>

       {!isLoading && (featured ?? []).length === 0 ? null : (
       <section className="space-y-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          ⭐️ Featured Startups
        </h2>
        {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {(featured ?? []).map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
       </section>
       )}

        <section className="space-y-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            ❓ FAQ
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
                  match solo geniuses with existing teams in our cohort who need technical help. Just join our community and we'll help you find a team.
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
