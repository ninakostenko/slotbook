import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { BottomNav, SidebarNav } from "@/components/dashboard/nav-links";
import { RequireBusiness } from "@/components/dashboard/require-business";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { UserMenu, UserMenuSkeleton } from "@/components/dashboard/user-menu";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
      <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <CalendarDays className="size-4" aria-hidden="true" />
      </span>
      SlotBook
    </Link>
  );
}

// The shell (logo, menus) is static and shows instantly.
// Only the parts that read the session wait, behind <Suspense>.
export default function DashboardLayout({
  children,
}: LayoutProps<"/[locale]/dashboard">) {
  return (
    <div className="flex min-h-full flex-1">
      <Suspense fallback={null}>
        <RequireBusiness />
      </Suspense>

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r p-4 md:flex">
        <Logo />
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-4 border-t pt-4">
          <LocaleSwitcher className="self-start" />
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
