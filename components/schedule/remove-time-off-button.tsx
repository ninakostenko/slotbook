"use client";

import { Loader2, X } from "lucide-react";
import { useTransition } from "react";

import { removeTimeOff } from "@/app/(dashboard)/dashboard/schedule/actions";
import { Button } from "@/components/ui/button";

type RemoveTimeOffButtonProps = {
  timeOffId: string;
  label: string; // the formatted date, for the screen reader label
};

export function RemoveTimeOffButton({
  timeOffId,
  label,
}: RemoveTimeOffButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Remove day off ${label}`}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await removeTimeOff(timeOffId);
        })
      }
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <X aria-hidden="true" />
      )}
    </Button>
  );
}
