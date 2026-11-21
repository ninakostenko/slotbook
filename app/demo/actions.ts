"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  DEMO_EMAIL,
  getDemoPassword,
  isDemoFresh,
  resetDemo,
} from "@/lib/demo";

// "Try the demo": signs the visitor in as the demo owner, with no form to fill in.
// It is a public endpoint on purpose. The demo account holds only sample data,
// which resets every day.
export async function startDemo() {
  if (!(await isDemoFresh())) {
    await resetDemo();
  }

  const signIn = async () =>
    auth.api.signInEmail({
      body: { email: DEMO_EMAIL, password: getDemoPassword() },
      headers: await headers(),
    });

  try {
    await signIn();
  } catch {
    // The stored password may be out of date; resetDemo sets it again. Try once more.
    await resetDemo();
    await signIn();
  }

  redirect("/dashboard");
}
