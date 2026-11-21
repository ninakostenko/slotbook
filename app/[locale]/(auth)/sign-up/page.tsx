import { SignUpForm } from "@/components/auth/sign-up-form";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { pageTitle } from "@/lib/i18n/metadata";

export const generateMetadata = pageTitle("meta.signUp");

export default function SignUpPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16">
      <LocaleSwitcher className="absolute top-4 right-4" />
      <SignUpForm />
    </main>
  );
}
