import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Link2,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { DemoButton } from "@/components/landing/demo-button";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Settings2,
    title: "Set up in minutes",
    text: "Add your services and working hours. Days off close the calendar for you.",
  },
  {
    icon: Link2,
    title: "Share one link",
    text: "Put it in your Instagram bio or send it in a chat. There is nothing for clients to install.",
  },
  {
    icon: CalendarCheck,
    title: "Clients book themselves",
    text: "They choose a free time and book. A taken time can never be booked twice.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-24">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
            </span>
            SlotBook
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
            Your booking page, ready in five minutes
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Share one simple link. Clients choose a free time and book
            instantly: no account, no back-and-forth, no double bookings.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Create my booking page
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/book/demo-studio">
                See how clients book
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Just looking? You can also <DemoButton /> with sample data.
          </p>
        </section>

        <section className="border-y bg-muted/60 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Less messaging, more time for your clients
          </h2>
          <p className="mt-4 text-muted-foreground">
            No more &ldquo;is 3 pm free?&rdquo; in direct messages. Your clients
            see the real free times, and you see every booking in one place.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/sign-up">
              Create my booking page
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        SlotBook · a portfolio project by Nina Kostenko ·{" "}
        <a
          href="https://github.com/ninakostenko/slotbook"
          className="text-primary hover:underline"
        >
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}
