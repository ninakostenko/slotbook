import { z } from "zod";

import { businessSchema } from "@/lib/validations/onboarding";

// The messages are keys of lib/i18n/messages. FieldError translates them when it shows them.
export const businessDetailsSchema = z.object({
  name: businessSchema.shape.name,

  description: z.string().trim().max(200, "validation.descriptionMax"),
});

export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;
