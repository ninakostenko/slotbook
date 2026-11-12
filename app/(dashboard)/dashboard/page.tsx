import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentBusiness, getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Overview · SlotBook",
};

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={<div className="h-16 w-72 animate-pulse rounded bg-muted" />}
      >
        <Greeting />
      </Suspense>
      <p className="mt-6 text-muted-foreground">
        Your bookings and stats will appear here.
      </p>
    </div>
  );
}

async function Greeting() {
  const [user, business] = await Promise.all([
    getCurrentUser(),
    getCurrentBusiness(),
  ]);
  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome, {firstName}
      </h1>
      {business && (
        <p className="mt-1 text-muted-foreground">
          {business.name} · your booking link:{" "}
          <span className="font-medium text-foreground">
            /book/{business.slug}
          </span>
        </p>
      )}
    </div>
  );
}
