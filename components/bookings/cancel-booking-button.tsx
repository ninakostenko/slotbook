"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { cancelBooking } from "@/app/[locale]/(dashboard)/dashboard/bookings/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CancelBookingButtonProps = {
  bookingId: string;
  // For example "Maria · Massage · Thu, 3 Dec, 10:00". It tells the owner what they cancel.
  summary: string;
};

export function CancelBookingButton({
  bookingId,
  summary,
}: CancelBookingButtonProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (result?.error) {
        setError(t(result.error));
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("bookings.cancel")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bookings.cancelTitle")}</DialogTitle>
          <DialogDescription>
            {t("bookings.cancelDescription", { summary })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("bookings.keep")}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="animate-spin" aria-hidden="true" />
            )}
            {t("bookings.cancelConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
