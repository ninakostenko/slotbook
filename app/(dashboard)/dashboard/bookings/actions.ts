"use server";

import { revalidatePath } from "next/cache";

import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";

// The owner cancels a booking. The time becomes free again for other clients.
export async function cancelBooking(bookingId: string) {
  const business = await getCurrentBusiness();
  if (!business) {
    return { error: "Business not found" };
  }

  // `businessId` in the where keeps an owner from cancelling another business's booking
  // by sending its id. Only a confirmed booking can be cancelled.
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, businessId: business.id, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
  if (result.count === 0) {
    return { error: "Booking not found" };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/book/${business.slug}`);
}
