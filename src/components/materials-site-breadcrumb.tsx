"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MATERIALS_ROUTES = [
  "/dashboard/review/materials",
  "/dashboard/mentor/materials",
  "/dashboard/materials",
] as const;

export function getMaterialsRoute(pathname: string) {
  return MATERIALS_ROUTES.find((route) => pathname.startsWith(route)) ?? null;
}

function fileIdFromPath(pathname: string, basePath: string) {
  const prefix = `${basePath}/f/`;
  if (!pathname.startsWith(prefix)) return null;
  const id = pathname.slice(prefix.length).split("/")[0];
  return id || null;
}

export function MaterialsSiteBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = getMaterialsRoute(pathname);
  const fileId = basePath ? fileIdFromPath(pathname, basePath) : null;
  const folderId = searchParams.get("folder");

  const list = trpc.material.list.useQuery(
    { parentId: folderId },
    { enabled: Boolean(basePath) && !fileId },
  );
  const file = trpc.material.get.useQuery(
    { id: fileId ?? "" },
    { enabled: Boolean(basePath) && Boolean(fileId) },
  );

  if (!basePath) {
    return (
      <h1 className="text-base font-medium tracking-tight">Materials</h1>
    );
  }

  const folderHref = (id: string | null) =>
    id ? `${basePath}?folder=${id}` : basePath;

  const breadcrumbs = fileId
    ? (file.data?.breadcrumbs ?? [])
    : (list.data?.breadcrumbs ?? []);
  const currentName = fileId ? file.data?.name : null;
  const loading = fileId ? file.isLoading : list.isLoading;

  if (loading && breadcrumbs.length === 0 && !currentName) {
    return (
      <h1 className="text-base font-medium tracking-tight">Materials</h1>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-base font-medium tracking-tight text-foreground">
        <BreadcrumbItem>
          {breadcrumbs.length === 0 && !currentName ? (
            <BreadcrumbPage>Materials</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href={folderHref(null)} />}>
              Materials
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1 && !currentName;
          return (
            <Fragment key={crumb.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={folderHref(crumb.id)} />}>
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
        {currentName ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
