"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

type CopyLinkButtonProps = {
  // The page path, for example "/book/glow-beauty-studio". The site address is added in the browser.
  path: string;
};

// Copies the full link of the booking page, so the owner can paste it into a chat or a profile.
export function CopyLinkButton({ path }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useT();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The browser refused (no permission, or not a secure page). Nothing to do.
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? t("dashboard.copied") : t("dashboard.copyLink")}
    </Button>
  );
}
