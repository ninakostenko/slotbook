-- Two active bookings of the same business can never overlap in time.
-- The database enforces this, so it holds even when two clients press
-- "Book" at the same moment and both pass the check in the app.

-- Lets a GiST index compare plain values (businessId) together with ranges.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- tstzrange(start, end) is half-open: it includes the start and leaves out the end,
-- so a booking that ends at 10:00 and one that starts at 10:00 do not overlap.
-- Cancelled bookings are left out, so their time can be booked again.
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_no_overlap"
  EXCLUDE USING gist (
    "businessId" WITH =,
    tstzrange("startsAt", "endsAt") WITH &&
  )
  WHERE ("status" <> 'CANCELLED');
