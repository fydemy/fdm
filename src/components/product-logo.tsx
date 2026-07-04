import { cn } from "@/lib/utils";

type ProductLogoProps = {
  src?: string | null;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const;

export function ProductLogo({
  src,
  name,
  className,
  size = "md",
}: ProductLogoProps) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={`${name} logo`}
      className={cn(
        "shrink-0 rounded-lg object-cover ring-1 ring-border",
        sizeClass[size],
        className,
      )}
    />
  );
}
