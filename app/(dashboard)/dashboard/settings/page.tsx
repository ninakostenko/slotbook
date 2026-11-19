import type { Metadata } from "next";
import { Suspense } from "react";

import { BusinessForm } from "@/components/settings/business-form";
import { getCurrentBusiness } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Settings · SlotBook",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Settings
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account and booking page.
      </p>

      <Suspense fallback={<p className="mt-8">Loading…</p>}>
        <BusinessSettings />
      </Suspense>
    </div>
  );
}

// Reads the business on the server and gives its current values to the form.
async function BusinessSettings() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <section className="mt-8 max-w-xl">
      <h2 className="text-lg font-semibold">Business</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The name and the description clients see on your booking page.
      </p>
      <BusinessForm
        name={business.name}
        description={business.description ?? ""}
      />
    </section>
  );
}
