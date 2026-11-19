import { z } from "zod";

import { businessSchema } from "@/lib/validations/onboarding";

export const businessDetailsSchema = z.object({
  name: businessSchema.shape.name,

  description: z
    .string()
    .trim()
    .max(200, "Description must be at most 200 characters"),
});

export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;
