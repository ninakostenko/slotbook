"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/validations/onboarding";

export async function createService(input: unknown) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Some fields are not valid." };
  }
  await prisma.service.create({
    data: {
      businessId: business.id,
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
      priceCents: Math.round(parsed.data.price * 100),
    },
  });

  // Каже Next.js оновити сторінку послуг, щоб нова послуга одразу з'явилась у списку.
  revalidatePath("/dashboard/services");
}
