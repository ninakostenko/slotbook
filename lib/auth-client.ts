import { createAuthClient } from "better-auth/react";

// Browser-side auth: authClient.signUp.email(), authClient.signIn.email(), authClient.signOut().
export const authClient = createAuthClient();
