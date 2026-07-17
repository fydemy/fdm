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

const testimonials = [
  {
    name: "Nabila Rahmadani",
    image: "/profile/nabila.png",
    role: "1M+ followers @Tiktok, Founder @CariKOL (formerly Buzzeryok)",
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

          <div className="w-full space-y-4 text-left mt-24">
            <h2 className="text-center text-sm text-muted-foreground">
              What Founders say
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-2xl border bg-card p-4 text-left shadow-sm"
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
       {!isLoading && (featured ?? []).length === 0 ? null : (
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

          <div className="grid gap-4 md:grid-cols-2">
            {(featured ?? []).map((launch) => (
              <LaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
       </section>
       )}

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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upfront-fee">
              <AccordionTrigger>
                Is there any upfront fee or hidden cash cost to join?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                There&apos;s no cost to join the program itself. We only require a fully refundable Rp 3,000,000 deposit to reserve your place. In our experience, this small commitment keeps founders engaged, encourages them to show up consistently, and helps them get the most out of the program—resulting in a more dedicated and focused cohort.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-you-get">
              <AccordionTrigger>
                What do you invest to help us build?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  We invest our resources in mentors, cloud infrastructure, co-working venues across Indonesia, and our network of YC founders, MIT, Stanford, Harvard, and other top universities to help you build your product.
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
