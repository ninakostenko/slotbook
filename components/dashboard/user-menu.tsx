import { getCurrentUser } from "@/lib/dal";

// Reads the session, so the layout renders it inside <Suspense>.
export async function UserMenu() {
  const user = await getCurrentUser();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
        aria-hidden="true"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      {/* TODO (Nina): <SignOutButton /> goes here */}
    </div>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <span className="block h-3 w-24 animate-pulse rounded bg-muted" />
        <span className="block h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
