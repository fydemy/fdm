"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  external?: boolean;
};

function getActiveNavUrl(pathname: string, items: NavItem[]) {
  let activeUrl: string | null = null;

  for (const item of items) {
    if (item.external) continue;

    const matches =
      item.url === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.url || pathname.startsWith(`${item.url}/`);

    if (matches && (!activeUrl || item.url.length > activeUrl.length)) {
      activeUrl = item.url;
    }
  }

  return activeUrl;
}

export function NavMain({
  items,
  label,
}: {
  items: NavItem[];
  label?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = getActiveNavUrl(pathname, items) === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={active}
                  render={
                    item.external ? (
                      <a href={item.url} target="_blank" rel="noreferrer" />
                    ) : (
                      <Link href={item.url} />
                    )
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
