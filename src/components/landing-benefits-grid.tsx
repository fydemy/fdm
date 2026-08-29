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
    title: "$0 fee & equity free",
    description:
      "Commit or get kicked out. Except for option B track to certain extent.",
    icon: DollarSign,
  },
  {
    title: "2 months virtual cohort",
    description:
      "Flexible and remote.",
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
  className,
}: {
  className?: string;
}) {
  return (
    <section className={cn("w-full max-w-3xl space-y-6", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <BenefitCard key={benefit.title} {...benefit} />
        ))}
      </div>
    </section>
  );
}
