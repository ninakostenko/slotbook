import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account · SlotBook",
};

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <SignUpForm />
    </main>
  );
}
