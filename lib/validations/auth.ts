import { z } from "zod";

// The messages are keys of lib/i18n/messages. FieldError translates them when it shows them.

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "validation.nameMin"),

  email: z.string().trim().email("validation.email"),
  password: z
    .string()
    .min(8, "validation.passwordMin")
    .max(128, "validation.passwordMax"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("validation.email"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export type SignInInput = z.infer<typeof signInSchema>;
