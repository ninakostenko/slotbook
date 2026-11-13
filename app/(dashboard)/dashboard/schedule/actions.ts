"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { timeToMinutes } from "@/lib/time";
import { scheduleSchema } from "@/lib/validations/onboarding";

export async function updateSchedule(input: unknown) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Some fields are not valid. Please check the form." };
  }

  const rows = parsed.data.days
    .filter((day) => day.enabled)
    .map((day) => ({
      businessId: business.id,
      dayOfWeek: day.dayOfWeek,
      startMinute: timeToMinutes(day.start),
      endMinute: timeToMinutes(day.end),
    }));

  await prisma.$transaction([
    prisma.workingHours.deleteMany({ where: { businessId: business.id } }),
    prisma.workingHours.createMany({ data: rows }),
  ]);

  revalidatePath("/dashboard/schedule");
}
