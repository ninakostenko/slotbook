import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Data Access Layer: the one place that decides who the current user is.
// Every page or action that needs the user calls this, so the check cannot be forgotten.
// `cache` makes repeated calls within one request hit the database only once.
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  // Return only what the UI needs, not the whole session.
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
});

// The signed-in owner's business, or null if they have not finished onboarding.
export const getCurrentBusiness = cache(async () => {
  const user = await getCurrentUser();

  return prisma.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true, name: true, slug: true, timezone: true },
  });
});
