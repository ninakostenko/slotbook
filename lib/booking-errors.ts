// True when the database refused a booking because it overlaps another one.
// That is the "Booking_no_overlap" exclusion constraint, and PostgreSQL reports
// it with the code 23P01. Prisma wraps the code a few levels deep, so we look for it there.
export function isOverlapError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const meta = (error as { meta?: unknown }).meta;
  if (typeof meta !== "object" || meta === null) return false;
  const adapterError = (meta as { driverAdapterError?: unknown })
    .driverAdapterError;
  if (typeof adapterError !== "object" || adapterError === null) return false;
  const cause = (adapterError as { cause?: unknown }).cause;
  if (typeof cause !== "object" || cause === null) return false;
  return (cause as { originalCode?: unknown }).originalCode === "23P01";
}
