import { z } from "zod";

// The messages are keys of lib/i18n/messages. FieldError translates them when it shows them.

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.businessNameMin")
    .max(60, "validation.businessNameMax"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "validation.linkMin")
    .max(40, "validation.linkMax")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "validation.linkFormat"),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.serviceNameMin")
    .max(60, "validation.serviceNameMax"),
  // Number inputs give NaN when empty, so the custom `error` covers that case too.
  durationMinutes: z
    .number({ error: "validation.durationRequired" })
    .int("validation.durationWhole")
    .min(5, "validation.durationMin")
    .max(480, "validation.durationMax"),
  price: z
    .number({ error: "validation.priceRequired" })
    .min(0, "validation.priceNegative")
    .max(100_000, "validation.priceHigh"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// "09:00" style time, 00:00 to 23:59.
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "validation.timeFormat");

export const dayScheduleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday ... 6 = Saturday
    enabled: z.boolean(),
    start: time,
    end: time,
  })
  // "09:00" < "18:00" works as plain string comparison because both have the same format.
  .refine((day) => !day.enabled || day.start < day.end, {
    message: "validation.endAfterStart",
    path: ["end"],
  });

export const scheduleSchema = z.object({
  days: z
    .array(dayScheduleSchema)
    .length(7)
    .refine((days) => days.some((day) => day.enabled), {
      message: "validation.chooseWorkingDay",
    }),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

// Everything the wizard sends to the server in one go.
export const onboardingSchema = z.object({
  business: businessSchema,
  service: serviceSchema,
  schedule: scheduleSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// A whole day off, as "YYYY-MM-DD" (the format of <input type="date"> and of the calendar).
export const timeOffSchema = z.object({
  date: z.iso.date("validation.pickDate"),
});

export type TimeOffInput = z.infer<typeof timeOffSchema>;
