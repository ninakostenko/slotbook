"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { cancelBookingByToken } from "@/app/[locale]/booking/[token]/actions";
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

// The client's "Cancel booking" button, with a question first.
export function CancelMyBookingButton({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingByToken(token);
      if (result?.error) {
        setError(result.error);
        return;
      }
      // The page refreshes by itself and shows that the booking is cancelled.
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cancel booking</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your booking?</DialogTitle>
          <DialogDescription>
            The time becomes free again for other clients.
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
            Yes, cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
