"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { timeToMinutes } from "@/lib/time";
import { scheduleSchema, timeOffSchema } from "@/lib/validations/onboarding";

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

export async function addTimeOff(input: unknown) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  const parsed = timeOffSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Pick a valid date." };
  }

  try {
    await prisma.timeOff.create({
      data: {
        businessId: business.id,
        // Midnight UTC, so the stored date is the same in every time zone.
        date: new Date(`${parsed.data.date}T00:00:00Z`),
      },
    });
  } catch (error) {
    // P2002 = unique constraint failed: this business already has this date off.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "This day is already off" };
    }
    throw error;
  }

  revalidatePath("/dashboard/schedule");
}

export async function removeTimeOff(timeOffId: string) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  // Both conditions: the day off must belong to this business (no IDOR).
  const result = await prisma.timeOff.deleteMany({
    where: { id: timeOffId, businessId: business.id },
  });

  if (result.count === 0) {
    return { error: "Day off not found" };
  }

  revalidatePath("/dashboard/schedule");
}
