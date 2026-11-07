import { ArrowRight, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
        </span>
        SlotBook
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        Your booking page, ready in five minutes
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Share one simple link. Clients choose a free time and book instantly: no
        account, no back-and-forth, no double bookings.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg">
          Get started free
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button size="lg" variant="outline">
          Try the demo
        </Button>
      </div>
    </main>
  );
}
