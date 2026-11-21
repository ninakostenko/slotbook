import { redirect } from "next/navigation";
import { Suspense } from "react";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentBusiness } from "@/lib/dal";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { pageTitle } from "@/lib/i18n/metadata";

export const generateMetadata = pageTitle("meta.onboarding");

export default function OnboardingPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <LocaleSwitcher className="absolute top-4 right-4" />
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-lg animate-pulse rounded-xl bg-muted" />
        }
      >
        <OnboardingGate />
      </Suspense>
    </main>
  );
}

// Reads the session and the database, so it renders inside <Suspense>.
async function OnboardingGate() {
  const business = await getCurrentBusiness();

  // Onboarding is done only once.
  if (business) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
