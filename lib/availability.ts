import { prisma } from "@/lib/db";
import { getAvailableSlots, type GetAvailableSlotsInput } from "@/lib/slots";
import { dateInTimeZone, minutesInTimeZone, todayInTimeZone } from "@/lib/time";

// Collects everything getAvailableSlots needs for one day: working hours, bookings,
// the service length. Returns null when nothing can be booked (no service, day off).
//
// This function connects the database to getAvailableSlots (which knows nothing
// about the database). Its job: collect the inputs, then call getAvailableSlots.
async function loadDay(
  businessId: string,
  serviceId: string,
  date: string, // "YYYY-MM-DD"
): Promise<GetAvailableSlotsInput | null> {
  // Look for the row with BOTH id and businessId, so one business cannot use
  // another business's service.
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  });
  if (!service) return null;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) return null;
  const timezone = business.timezone;

  // The date as a "day" value, the way days off are stored: midnight UTC.
  const day = new Date(`${date}T00:00:00Z`);

  // Is this day a day off? Then there are no slots.
  const dayOff = await prisma.timeOff.findUnique({
    where: { businessId_date: { businessId, date: day } },
  });
  if (dayOff) return null;

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

  return {
    workingHours,
    durationMinutes: service.durationMinutes,
    bookings,
    // Times follow the length of the service: a 65-minute massage starts at 09:00, 10:05, 11:10...
    stepMinutes: service.durationMinutes,
    earliestStart,
  };
}

// Free start times for one service on one day.
export async function getSlotsForDay(
  businessId: string,
  serviceId: string,
  date: string,
): Promise<number[]> {
  const day = await loadDay(businessId, serviceId, date);
  return day ? getAvailableSlots(day) : [];
}

// Every start time of the working day, each marked free or taken.
// "All" means the times that would exist with no bookings at all.
export async function getDaySlots(
  businessId: string,
  serviceId: string,
  date: string,
): Promise<{ time: number; free: boolean }[]> {
  const day = await loadDay(businessId, serviceId, date);
  if (!day) return [];
  const free = new Set(getAvailableSlots(day));
  return getAvailableSlots({ ...day, bookings: [] }).map((time) => ({
    time,
    free: free.has(time),
  }));
}

// Which of the given days ("YYYY-MM-DD") the business is closed: a weekday with
// no working hours, or a day off the owner added. Used to grey out the calendar.
export async function getClosedDays(
  businessId: string,
  days: string[],
): Promise<string[]> {
  if (days.length === 0) return [];

  const [hoursRows, timeOffRows] = await Promise.all([
    prisma.workingHours.findMany({ where: { businessId } }),
    prisma.timeOff.findMany({
      where: {
        businessId,
        date: {
          gte: new Date(`${days[0]}T00:00:00Z`),
          lte: new Date(`${days[days.length - 1]}T00:00:00Z`),
        },
      },
    }),
  ]);

  const workingWeekdays = new Set(hoursRows.map((row) => row.dayOfWeek));
  // Days off are stored at midnight UTC, so the UTC date is the right one.
  const daysOff = new Set(
    timeOffRows.map((row) => row.date.toISOString().slice(0, 10)),
  );

  return days.filter((day) => {
    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
    return !workingWeekdays.has(weekday) || daysOff.has(day);
  });
}
