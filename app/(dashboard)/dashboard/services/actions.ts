"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { serviceSchema, type ServiceInput } from "@/lib/validations/onboarding";

// Turns form values into database fields. Shared by create and update,
// so the price is always converted to cents the same way.
function toServiceData(data: ServiceInput) {
  return {
    name: data.name,
    durationMinutes: data.durationMinutes,
    priceCents: Math.round(data.price * 100),
  };
}

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
      ...toServiceData(parsed.data),
    },
  });

  // Каже Next.js оновити сторінку послуг, щоб нова послуга одразу з'явилась у списку.
  revalidatePath("/dashboard/services");
}

export async function updateService(serviceId: string, input: unknown) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Some fields are not valid." };
  }

  const result = await prisma.service.updateMany({
    where: { id: serviceId, businessId: business.id },
    data: toServiceData(parsed.data),
  });

  if (result.count === 0) {
    return { error: "Service not found" };
  }

  revalidatePath("/dashboard/services");
}
