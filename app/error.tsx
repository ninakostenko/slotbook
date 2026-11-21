"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

// Shown when something unexpected fails while a page renders. `reset` tries the page again.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-4 text-muted-foreground">
        We could not load this page. Please try again in a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to the start</Link>
        </Button>
      </div>
    </main>
  );
}
