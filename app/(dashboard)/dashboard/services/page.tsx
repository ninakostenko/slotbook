import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services · SlotBook",
};

// Placeholder until this section is built (Week 2 of the plan).
export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Services
      </h1>
      <p className="mt-2 text-muted-foreground">
        Add the services clients can book.
      </p>
      <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Coming soon
      </div>
    </div>
  );
}
