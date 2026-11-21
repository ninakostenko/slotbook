import { SignInForm } from "@/components/auth/sign-in-form";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { pageTitle } from "@/lib/i18n/metadata";

export const generateMetadata = pageTitle("meta.signIn");

export default function SignInPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16">
      <LocaleSwitcher className="absolute top-4 right-4" />
      <SignInForm />
    </main>
  );
}
