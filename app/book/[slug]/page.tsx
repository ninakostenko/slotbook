import { SlotPicker } from "@/components/booking/slot-picker";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Book an appointment · SlotBook",
};

// The page itself does NOT await params. It passes the promise down, so the page
// shell can be prerendered and only the part inside <Suspense> waits for data.
export default function BookingPage({
  params,
  searchParams,
}: PageProps<"/book/[slug]">) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <BusinessServices params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BusinessServices({
  params,
  searchParams,
}: {
  params: PageProps<"/book/[slug]">["params"];
  searchParams: PageProps<"/book/[slug]">["searchParams"];
}) {
  const { slug } = await params;
  const query = await searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
  });
  if (!business) return notFound();

  const services = await prisma.service.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: [{ name: "asc" }],
  });

  // The ?service= value comes from the URL, so check it is one of the active services.
  const selectedService = services.find((s) => s.id === query.service);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
      {business.description && (
        <p className="mt-2 text-muted-foreground">{business.description}</p>
      )}
      {services.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No services available yet.</p>
      ) : (
        <ul className="mt-8 divide-y rounded-lg border">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={`/book/${business.slug}?service=${service.id}`}
                className="block p-4 hover:bg-muted"
              >
                <p className="font-medium">{service.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {service.durationMinutes} min · {service.priceCents / 100} UAH
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {selectedService && (
        <SlotPicker
          business={business}
          service={selectedService}
          dateParam={typeof query.date === "string" ? query.date : undefined}
          timeParam={typeof query.time === "string" ? query.time : undefined}
        />
      )}
    </div>
  );
}
