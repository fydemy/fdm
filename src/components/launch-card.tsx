import Link from "next/link";
import { ProductLogo } from "@/components/product-logo";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LaunchCardProps = {
  launch: {
    id: string;
    title: string;
    createdAt: Date | string;
    application: {
      name: string;
      logoUrl?: string | null;
      websiteUrl?: string | null;
    };
  };
};

export function LaunchCard({ launch }: LaunchCardProps) {
  return (
    <Link href={`/launches/${launch.id}`} className="block">
      <Card className="p-0! rounded-none!">
        <CardHeader className="flex flex-row items-start gap-3 p-0!">
          <ProductLogo
            src={launch.application.logoUrl}
            name={launch.application.name}
            size="md"
          />
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="tracking-tight">{launch.title}</CardTitle>
            <CardDescription>
              {launch.application.name} ·{" "}
              {new Date(launch.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
