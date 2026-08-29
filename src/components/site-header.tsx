"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  MaterialsSiteBreadcrumb,
  getMaterialsRoute,
} from "@/components/materials-site-breadcrumb";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/apply": "Application",
  "/dashboard/launches": "Launches",
  "/dashboard/review": "Review applications",
  "/dashboard/review/launches": "Launches",
};

function getTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/dashboard/review/")) return "Application review";
  if (pathname.startsWith("/dashboard/mentor")) return "Mentors";
  if (pathname.startsWith("/dashboard/partner")) return "Partners";
  return "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const materials = getMaterialsRoute(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        {materials ? (
          <Suspense
            fallback={
              <h1 className="text-base font-medium tracking-tight">Materials</h1>
            }
          >
            <MaterialsSiteBreadcrumb />
          </Suspense>
        ) : (
          <h1 className="text-base font-medium tracking-tight">
            {getTitle(pathname)}
          </h1>
        )}
      </div>
    </header>
  );
}
