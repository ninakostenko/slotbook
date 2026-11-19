"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { businessDetailsSchema } from "@/lib/validations/business";

// Saves the name and the description of the owner's business.
// It follows the same order as updateService: business, validate, write, revalidate.
export async function updateBusiness(input: unknown) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  const parsed = businessDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Some fields are not valid." };
  }

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });
  revalidatePath("/dashboard/settings");
  revalidatePath(`/book/${business.slug}`);
}
