"use client";

import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  Scissors,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "dashboard.nav.overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/bookings",
    label: "dashboard.nav.bookings",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/services",
    label: "dashboard.nav.services",
    icon: Scissors,
  },
  { href: "/dashboard/schedule", label: "dashboard.nav.schedule", icon: Clock },
  {
    href: "/dashboard/settings",
    label: "dashboard.nav.settings",
    icon: Settings,
  },
];

function isActive(pathname: string, href: string) {
  // Overview is active only on /dashboard itself, the others also on their subpages.
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

// Sidebar on desktop.
export function SidebarNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav aria-label={t("dashboard.nav.main")} className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-accent text-accent-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}

// Bottom bar on phones.
export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      aria-label={t("dashboard.nav.main")}
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t bg-background md:hidden"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground",
              active && "text-primary",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
