"use server";

import { redirect } from "next/navigation";

import { getCurrentBusiness, getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { onboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingResult = {
  error: string;
  // Set when the error belongs to a specific field, so the form can show it there.
  field?: "business.slug";
};

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// A Server Action: runs on the server, but the form calls it like a normal async function.
// Anyone can call it with any data, so it checks the user and validates the input itself.
export async function completeOnboarding(
  input: unknown,
): Promise<OnboardingResult | undefined> {
  const user = await getCurrentUser();

  if (await getCurrentBusiness()) {
    redirect("/dashboard");
  }

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Some fields are not valid. Please check the form." };
  }

  const { business, service, schedule } = parsed.data;

  try {
    // One nested create: the business, its first service and its working hours
    // are saved together, or nothing is saved if any part fails.
    await prisma.business.create({
      data: {
        ownerId: user.id,
        name: business.name,
        slug: business.slug,
        services: {
          create: {
            name: service.name,
            durationMinutes: service.durationMinutes,
            priceCents: Math.round(service.price * 100),
          },
        },
        workingHours: {
          create: schedule.days
            .filter((day) => day.enabled)
            .map((day) => ({
              dayOfWeek: day.dayOfWeek,
              startMinute: timeToMinutes(day.start),
              endMinute: timeToMinutes(day.end),
            })),
        },
      },
    });
  } catch (error) {
    // P2002 = unique constraint failed. The owner check above rules out ownerId,
    // so here it means another business already uses this slug.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "This link is already taken. Try another one.",
        field: "business.slug",
      };
    }
    throw error;
  }

  redirect("/dashboard");
}
