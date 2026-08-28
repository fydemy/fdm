import {
  BookOpen,
  DollarSign,
  Globe,
  Handshake,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BENEFITS: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Alumni network",
    description:
      "Learn from founders who've shipped, scaled, and stayed in the game directly.",
    icon: Users,
  },
  {
    title: "Partner",
    description:
      "Getting advice early feedback, and getting connected to the right people.",
    icon: Wrench,
  },
  {
    title: "Playbook & tools",
    description:
      "AI playbook and tools that adapt to your startup's stage and needs.",
    icon: BookOpen,
  },
  {
    title: "Join / recruit a team",
    description:
      "Experience working at startups and recruiting a team.",
    icon: Handshake,
  },
  {
    title: "$0 fee & equity free (except option B track to certain extent)",
    description:
      "We take your commitment, if you don't, we could kick you out.",
    icon: DollarSign,
  },
  {
    title: "2 months & virtual cohort",
    description:
      "You can join while you're working or studying in universities.",
    icon: Globe,
  },
];

function BenefitCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-5 text-left">
      <div className="flex size-9 items-center justify-center rounded-lg border border-foreground/10 bg-background">
        <Icon className="size-4 text-foreground/70" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function LandingBenefitsGrid({
  title = "What you get",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={cn("w-full max-w-3xl space-y-6", className)}>
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <BenefitCard key={benefit.title} {...benefit} />
        ))}
      </div>
    </section>
  );
}
