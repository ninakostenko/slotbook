import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";
import { dateInTimeZone, minutesInTimeZone, todayInTimeZone } from "@/lib/time";

// Free start times for one service on one day, as minutes from midnight.
// Example: getSlotsForDay("biz1", "svc1", "2026-12-01") -> [540, 555, 570, ...]
//
// This function connects the database to getAvailableSlots (which knows nothing
// about the database). Its job: collect the inputs, then call getAvailableSlots.
export async function getSlotsForDay(
  businessId: string,
  serviceId: string,
  date: string, // "YYYY-MM-DD"
): Promise<number[]> {
  // Look for the row with BOTH id and businessId, so one business cannot use
  // another business's service.
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  });
  if (!service) return [];

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) return [];
  const timezone = business.timezone;

  // The date as a "day" value, the way days off are stored: midnight UTC.
  const day = new Date(`${date}T00:00:00Z`);

  // Is this day a day off? Then there are no slots.
  const dayOff = await prisma.timeOff.findUnique({
    where: { businessId_date: { businessId, date: day } },
  });
  if (dayOff) return [];

  // Working hours for this weekday (0 = Sunday). No row means a closed day.
  const hoursRow = await prisma.workingHours.findUnique({
    where: {
      businessId_dayOfWeek: { businessId, dayOfWeek: day.getUTCDay() },
    },
  });
  const workingHours = hoursRow
    ? { start: hoursRow.startMinute, end: hoursRow.endMinute }
    : null;

  // Bookings are exact moments in time, but "this day" depends on the time zone
  // of the business. So load a wide window (one day before to two days after),
  // then keep only the bookings that fall on this date in that time zone.
  const oneDay = 24 * 60 * 60 * 1000;
  const bookingRows = await prisma.booking.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      startsAt: {
        gte: new Date(day.getTime() - oneDay),
        lt: new Date(day.getTime() + 2 * oneDay),
      },
    },
  });
  const bookings = bookingRows
    .filter((b) => dateInTimeZone(b.startsAt, timezone) === date)
    .map((b) => ({
      start: minutesInTimeZone(b.startsAt, timezone),
      end: minutesInTimeZone(b.endsAt, timezone),
    }));

  // For today, slots that already started are not offered. Other days have no limit.
  const earliestStart =
    date === todayInTimeZone(timezone)
      ? minutesInTimeZone(new Date(), timezone)
      : undefined;

  return getAvailableSlots({
    workingHours,
    durationMinutes: service.durationMinutes,
    bookings,
    stepMinutes: 15,
    earliestStart,
  });
}
