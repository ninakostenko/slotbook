import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Every /api/auth/* request (sign up, sign in, sign out, session) is handled by Better Auth.
export const { GET, POST } = toNextJsHandler(auth);
