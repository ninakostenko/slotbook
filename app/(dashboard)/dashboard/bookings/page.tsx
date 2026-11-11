import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings · SlotBook",
};

// Placeholder until this section is built (Week 3 of the plan).
export default function BookingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Bookings
      </h1>
      <p className="mt-2 text-muted-foreground">
        See and manage your upcoming appointments.
      </p>
      <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Coming soon
      </div>
    </div>
  );
}
