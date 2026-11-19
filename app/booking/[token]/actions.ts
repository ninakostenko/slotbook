"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// A client cancels their own booking with the secret token from their link.
// There is no sign-in: whoever has the token (a long random string) may cancel it.
export async function cancelBookingByToken(token: string) {
  if (typeof token !== "string" || token.length === 0) {
    return { error: "Booking not found" };
  }

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    select: { id: true, business: { select: { slug: true } } },
  });
  if (!booking) {
    return { error: "Booking not found" };
  }

  // Only a confirmed booking that has not started yet can be cancelled.
  const result = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      status: "CONFIRMED",
      startsAt: { gt: new Date() },
    },
    data: { status: "CANCELLED" },
  });
  if (result.count === 0) {
    return { error: "This booking can no longer be cancelled." };
  }

  revalidatePath(`/booking/${token}`);
  revalidatePath(`/book/${booking.business.slug}`);
  revalidatePath("/dashboard", "layout");
}
