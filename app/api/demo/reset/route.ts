import { timingSafeEqual } from "node:crypto";

import { resetDemo } from "@/lib/demo";

// Vercel Cron calls this once a day (see vercel.json) and sends
// "Authorization: Bearer <CRON_SECRET>". Without the right secret nothing happens.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const allowed =
    !!secret &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!allowed) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await resetDemo();
  return Response.json({ ok: true, ...result });
}
