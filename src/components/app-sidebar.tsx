"use client";

import * as React from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/seo";
import {
  ClipboardCheckIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  PackageIcon,
  RocketIcon,
  ZapIcon,
} from "lucide-react";

const discordNavItem: NavItem = {
  title: "Discord",
  url: siteConfig.discordInviteUrl,
  icon: <MessageCircleIcon />,
  external: true,
};

const applicantNav: NavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Applications",
    url: "/dashboard/apply",
    icon: <FileTextIcon />,
  },
  {
    title: "Launches",
    url: "/dashboard/launches",
    icon: <RocketIcon />,
  },
  {
    title: "Materials",
    url: "/dashboard/materials",
    icon: <PackageIcon />,
  },
  {
    title: "Traction or Die",
    url: "/dashboard/traction-or-die",
    icon: <ZapIcon />,
  },
  discordNavItem,
];

const reviewerNav: NavItem[] = [
  {
    title: "Applications",
    url: "/dashboard/review",
    icon: <ClipboardCheckIcon />,
  },
  {
    title: "Launches",
    url: "/dashboard/review/launches",
    icon: <RocketIcon />,
  },
  {
    title: "Materials",
    url: "/dashboard/review/materials",
    icon: <PackageIcon />,
  },
  discordNavItem,
];

const mentorNav: NavItem[] = [
  {
    title: "Applications",
    url: "/dashboard/mentor",
    icon: <ClipboardCheckIcon />,
  },
  {
    title: "Materials",
    url: "/dashboard/mentor/materials",
    icon: <PackageIcon />,
  },
  discordNavItem,
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const { data: me } = trpc.user.me.useQuery();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user;

  const nav = React.useMemo(() => {
    if (!me) return null;
    if (me.isReviewer) return { items: reviewerNav, label: "Review" };
    if (me.isMentor) return { items: mentorNav, label: "Mentor" };
    return { items: applicantNav, label: "Workspace" };
  }, [me]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-auto! py-2 data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <img src="/logo.svg" alt="Fydemy" className="h-7 w-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {mounted && nav ? (
          <NavMain items={nav.items} label={nav.label} />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        {mounted && user ? (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
              avatar: user.image ?? me?.image,
              roleLabel: me?.roleLabel ?? "Applicant",
            }}
          />
        ) : (
          <NavUserPlaceholder />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function NavUserPlaceholder() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="size-8 shrink-0 rounded-lg bg-muted" />
          <div className="grid flex-1 gap-1.5 text-left">
            <div className="h-3.5 w-24 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
