"use server";

import { revalidatePath } from "next/cache";

import { getSlotsForDay } from "@/lib/availability";
import { isOverlapError } from "@/lib/booking-errors";
import { prisma } from "@/lib/db";
import { zonedTimeToDate } from "@/lib/time";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";

export type CreateBookingResult =
  { ok: true; bookingId: string } | { ok: false; error: string };

// A Server Action is a public endpoint: anyone can call it with any data.
// So it checks everything itself, like completeOnboarding and updateService do.
export async function createBooking(
  slug: string,
  input: BookingInput,
): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid booking data" };

  const business = await prisma.business.findUnique({
    where: { slug },
  });
  if (!business) return { ok: false, error: "Business not found" };
  const { serviceId, date, time, clientName, clientEmail } = parsed.data;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id, isActive: true },
  });
  if (!service) return { ok: false, error: "not found service" };

  const slots = await getSlotsForDay(business.id, service.id, date);
  if (!slots.includes(time))
    return { ok: false, error: "This time was just taken" };

  const startsAt = zonedTimeToDate(date, time, business.timezone);
  const endsAt = new Date(
    startsAt.getTime() + service.durationMinutes * 60_000,
  );

  // The check above can pass for two clients at the same moment. The database then
  // refuses the second booking (the Booking_no_overlap constraint), and we say so.
  let booking: { id: string };
  try {
    booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        serviceId,
        clientName,
        clientEmail,
        startsAt,
        endsAt,
      },
    });
  } catch (error) {
    if (isOverlapError(error)) {
      revalidatePath(`/book/${slug}`);
      return { ok: false, error: "This time was just taken" };
    }
    throw error;
  }

  // Tell Next.js the free times changed, so the page shows the new list at once.
  revalidatePath(`/book/${slug}`);

  return { ok: true, bookingId: booking.id };
}
