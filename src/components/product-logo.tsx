import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

type ProductLogoProps = {
  src?: string | null;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 56, height: 56 },
} as const;

export function ProductLogo({
  src,
  name,
  className,
  size = "md",
}: ProductLogoProps) {
  if (!src) return null;

  const { width, height } = sizeClass[size];

  return (
    <OptimizedImage
      src={src}
      alt={`${name} logo`}
      width={width}
      height={height}
      className={cn(
        "shrink-0 rounded-lg object-cover ring-1 ring-border",
        className,
      )}
      sizes="(max-width: 768px) 32px, 40px"
    />
  );
}
