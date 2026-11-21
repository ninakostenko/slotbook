import { z } from "zod";

// The messages are keys of lib/i18n/messages. FieldError translates them when it shows them.

export const bookingSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "validation.nameMin")
    .max(60, "validation.nameMax"),

  clientEmail: z.email("validation.email"),

  // The next three come from the page address, not from what the client types.
  serviceId: z.string().min(1, "validation.pickService"),

  // A day as "YYYY-MM-DD".
  date: z.iso.date("validation.pickDate"),

  // The start time in minutes from midnight: 540 means 09:00.
  time: z
    .number("validation.pickTime")
    .int("validation.pickTime")
    .min(0, "validation.pickTime")
    .max(1439, "validation.pickTime"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Only the two fields the client types. The form uses this one;
// the server action uses the full bookingSchema.
export const clientDetailsSchema = bookingSchema.pick({
  clientName: true,
  clientEmail: true,
});

export type ClientDetailsInput = z.infer<typeof clientDetailsSchema>;
