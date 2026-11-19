"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { cancelBooking } from "@/app/(dashboard)/dashboard/bookings/actions";
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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            {summary}. The time becomes free again.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep booking</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="animate-spin" aria-hidden="true" />
            )}
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
