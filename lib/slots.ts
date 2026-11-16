// A stretch of time within one day, in minutes from midnight.
// Example: { start: 540, end: 600 } is 09:00–10:00.
export type TimeRange = {
  start: number;
  end: number;
};

export type GetAvailableSlotsInput = {
  // The working hours for this day, or null when the day is closed
  // (no WorkingHours row, or a day off).
  workingHours: TimeRange | null;
  // How long the service takes, for example 60.
  durationMinutes: number;
  // Bookings already made for this day.
  bookings: TimeRange[];
  // How often a slot can start: 15 means 09:00, 09:15, 09:30...
  stepMinutes: number;
};

// Returns the start minute of every free slot, for example [540, 555, 570].
export function getAvailableSlots({
  workingHours,
  durationMinutes,
  bookings,
  stepMinutes,
}: GetAvailableSlotsInput): number[] {
  if (!workingHours) {
    return [];
  }
  const slots: number[] = [];
  for (
    let start = workingHours.start;
    start + durationMinutes <= workingHours.end;
    start += stepMinutes
  ) {
    const end = start + durationMinutes;
    const overlaps = bookings.some(
      (booking) => start < booking.end && booking.start < end,
    );
    if (overlaps) continue;

    slots.push(start);
  }
  return slots;
}
