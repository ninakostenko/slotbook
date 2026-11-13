"use client";

import { CalendarPlus, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { addTimeOff } from "@/app/(dashboard)/dashboard/schedule/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toDateString } from "@/lib/time";

type AddTimeOffProps = {
  // Today in the business's time zone, "YYYY-MM-DD". Earlier days cannot be picked.
  today: string;
};

export function AddTimeOff({ today }: AddTimeOffProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // "2026-11-13" -> a local Date for the calendar (it works in the browser's time zone).
  const [year = 0, month = 1, day = 1] = today.split("-").map(Number);
  const firstAllowedDay = new Date(year, month - 1, day);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setError(null);
    setOpen(false);
    startTransition(async () => {
      const result = await addTimeOff({ date: toDateString(date) });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <CalendarPlus aria-hidden="true" />
            )}
            Add day off
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            onSelect={handleSelect}
            disabled={{ before: firstAllowedDay }}
            startMonth={firstAllowedDay}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
