import type { DragEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLImageElement>) => void;
}

// Custom component for optimized images
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  ...props
}: OptimizedImageProps) {
  // For external URLs, use regular img tag with optimization
  if (src.startsWith('http')) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        width={width}
        height={height}
        {...props}
      />
    );
  }

  // For local images, use Next.js Image component
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      priority={priority}
      fill={fill}
      sizes={sizes}
      quality={quality}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      {...(fill ? {} : { width, height })}
      {...props}
    />
  );
}

// Avatar component with lazy loading
interface AvatarProps {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
  };

  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={`${name} avatar`}
      width={width}
      height={height}
      className={cn("rounded-full", className)}
      sizes="(max-width: 768px) 40px, 64px"
    />
  );
}

// Profile image component for mentors/testimonials
interface ProfileImageProps {
  src: string;
  name: string;
  className?: string;
}

export function ProfileImage({ src, name, className }: ProfileImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={name}
      width={200}
      height={200}
      className={cn("rounded-lg object-cover", className)}
      sizes="(max-width: 768px) 100vw, 200px"
    />
  );
}

// Logo component with lazy loading
interface LogoProps {
  src: string;
  name: string;
  className?: string;
}

export function Logo({ src, name, className }: LogoProps) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name} logo`}
      width={120}
      height={120}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        "h-auto w-auto object-contain select-none [user-drag:none]",
        className,
      )}
      sizes="(max-width: 768px) 80px, 120px"
    />
  );
}