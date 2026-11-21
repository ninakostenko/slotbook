"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { startDemo } from "@/app/demo/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();

  return (
    <Button type="submit" variant="link" disabled={pending} className="px-1">
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {pending ? t("landing.openingDemo") : t("landing.exploreDemo")}
    </Button>
  );
}

// A form with one button. The server action signs in as the demo owner and redirects.
export function DemoButton() {
  return (
    <form action={startDemo} className="inline">
      <SubmitButton />
    </form>
  );
}
