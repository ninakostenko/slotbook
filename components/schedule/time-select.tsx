"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeOptions } from "@/lib/time";

// Built once: the same list is shared by every select on the page.
const options = timeOptions(15);

type TimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
  invalid?: boolean;
};

// A styled replacement for <input type="time">. The browser draws the native
// time picker itself, so its look and 12/24-hour format cannot be changed with CSS.
// This list always uses 24-hour "HH:MM" in 15-minute steps.
export function TimeSelect({
  value,
  onChange,
  invalid,
  "aria-label": ariaLabel,
}: TimeSelectProps) {
  // A time saved before this select existed (like "10:04") is kept in the list,
  // so opening the form never silently changes it.
  const items = options.includes(value) ? options : [...options, value].sort();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="w-24 tabular-nums"
        aria-label={ariaLabel}
        aria-invalid={invalid}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-60">
        {items.map((time) => (
          <SelectItem key={time} value={time} className="tabular-nums">
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
