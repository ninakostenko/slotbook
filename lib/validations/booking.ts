import { z } from "zod";

export const bookingSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),

  clientEmail: z.email("Enter a valid email"),

  // The next three come from the page address, not from what the client types.
  serviceId: z.string().min(1, "Pick a service"),

  // A day as "YYYY-MM-DD".
  date: z.iso.date("Pick a date"),

  // The start time in minutes from midnight: 540 means 09:00.
  time: z
    .number("Pick a time")
    .int("Pick a time")
    .min(0, "Pick a time")
    .max(1439, "Pick a time"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
