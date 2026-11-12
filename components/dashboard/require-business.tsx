import { redirect } from "next/navigation";

import { getCurrentBusiness } from "@/lib/dal";

// Renders nothing. Sends owners who have not finished onboarding to /onboarding.
// The dashboard layout renders it inside <Suspense> because it reads the session.
export async function RequireBusiness() {
  const business = await getCurrentBusiness();

  if (!business) {
    redirect("/onboarding");
  }

  return null;
}
