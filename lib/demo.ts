import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Service } from "@/lib/generated/prisma/client";
import {
  buildDemoBookings,
  demoDayOff,
  demoServices,
  demoWorkingHours,
} from "@/lib/demo-data";
import { todayInTimeZone, zonedTimeToDate } from "@/lib/time";

// The demo owner and business. Everything here works ONLY on this one account's
// business, found through its e-mail, so a reset can never touch real data.
export const DEMO_EMAIL = "demo@slotbook.app";
export const DEMO_SLUG = "demo-studio";
const DEMO_TIMEZONE = "Europe/Kyiv";

// The demo password lives in the environment (the same value locally and on Vercel,
// because both use one database). Visitors never see it: the "demo" button signs in for them.
export function getDemoPassword() {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("DEMO_PASSWORD is not set (use at least 8 characters).");
  }
  return password;
}

// Creates the demo user the first time, and keeps its password equal to DEMO_PASSWORD.
async function ensureDemoUser() {
  const password = getDemoPassword();
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: { name: "Demo Owner", email: DEMO_EMAIL, password },
    });
    return prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
  }

  const context = await auth.$context;
  await prisma.account.updateMany({
    where: { userId: existing.id, providerId: "credential" },
    data: { password: await context.password.hash(password) },
  });
  return existing;
}

// Puts the demo business back to a fresh state: the services, the hours, a day off
// and sample bookings around today. The cron job calls this once a day.
export async function resetDemo() {
  const user = await ensureDemoUser();
  const today = todayInTimeZone(DEMO_TIMEZONE);
  const sampleBookings = buildDemoBookings(today);

  const businessFields = {
    name: "Lumi Beauty Studio",
    slug: DEMO_SLUG,
    description:
      "A sample studio, so you can see how SlotBook works for you and for your clients. This data resets every day.",
    timezone: DEMO_TIMEZONE,
  };

  await prisma.$transaction(async (tx) => {
    const existing = await tx.business.findUnique({
      where: { ownerId: user.id },
    });

    // Bookings first: they point to the services, which cannot be deleted before them.
    if (existing) {
      await tx.booking.deleteMany({ where: { businessId: existing.id } });
      await tx.timeOff.deleteMany({ where: { businessId: existing.id } });
      await tx.workingHours.deleteMany({ where: { businessId: existing.id } });
      await tx.service.deleteMany({ where: { businessId: existing.id } });
    }

    const business = existing
      ? await tx.business.update({
          where: { id: existing.id },
          data: businessFields,
        })
      : await tx.business.create({
          data: { ...businessFields, ownerId: user.id },
        });

    await tx.workingHours.createMany({
      data: demoWorkingHours.map((hours) => ({
        ...hours,
        businessId: business.id,
      })),
    });
    await tx.timeOff.create({
      data: {
        businessId: business.id,
        date: new Date(`${demoDayOff(today)}T00:00:00Z`),
      },
    });

    const services: Service[] = [];
    for (const service of demoServices) {
      services.push(
        await tx.service.create({
          data: { ...service, businessId: business.id },
        }),
      );
    }

    await tx.booking.createMany({
      data: sampleBookings.map((booking) => {
        const service = services[booking.serviceIndex];
        if (!service) throw new Error("Demo booking has no service");
        const startsAt = zonedTimeToDate(
          booking.date,
          booking.startMinute,
          DEMO_TIMEZONE,
        );
        return {
          businessId: business.id,
          serviceId: service.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          startsAt,
          endsAt: new Date(
            startsAt.getTime() + service.durationMinutes * 60_000,
          ),
          status: booking.status,
        };
      }),
    });
  });

  return { slug: DEMO_SLUG, bookings: sampleBookings.length };
}

// True when the demo business exists and still has a booking in the future.
// Bookings are made relative to the day of the reset, so after a few days they are all
// in the past, and the demo should be refreshed.
export async function isDemoFresh() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { business: { select: { id: true } } },
  });
  if (!user?.business) return false;

  const upcoming = await prisma.booking.count({
    where: {
      businessId: user.business.id,
      status: "CONFIRMED",
      startsAt: { gte: new Date() },
    },
  });
  return upcoming > 0;
}
