import { z } from "zod";

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(60, "Business name must be at most 60 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Link must be at least 3 characters")
    .max(40, "Link must be at most 40 characters long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens, like anna-studio",
    ),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(60, "Service name must be at most 60 characters"),
  // Number inputs give NaN when empty, so the custom `error` covers that case too.
  durationMinutes: z
    .number({ error: "Enter a duration in minutes" })
    .int("Use whole minutes")
    .min(5, "A service takes at least 5 minutes")
    .max(480, "A service takes at most 8 hours"),
  price: z
    .number({ error: "Enter a price" })
    .min(0, "Price cannot be negative")
    .max(100_000, "Price is too high"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// "09:00" style time, 00:00 to 23:59.
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00");

export const dayScheduleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday ... 6 = Saturday
    enabled: z.boolean(),
    start: time,
    end: time,
  })
  // "09:00" < "18:00" works as plain string comparison because both have the same format.
  .refine((day) => !day.enabled || day.start < day.end, {
    message: "End time must be after start time",
    path: ["end"],
  });

export const scheduleSchema = z.object({
  days: z
    .array(dayScheduleSchema)
    .length(7)
    .refine((days) => days.some((day) => day.enabled), {
      message: "Choose at least one working day",
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
