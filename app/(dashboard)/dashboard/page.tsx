import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Overview · SlotBook",
};

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={<div className="h-9 w-64 animate-pulse rounded bg-muted" />}
      >
        <Greeting />
      </Suspense>
      <p className="mt-2 text-muted-foreground">
        Your bookings and stats will appear here.
      </p>
    </div>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  const firstName = user.name.split(" ")[0];

  return (
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      Welcome, {firstName}
    </h1>
  );
}
