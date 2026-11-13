import type { Metadata } from "next";
import { Suspense } from "react";

import { AddServiceDialog } from "@/components/services/add-service-dialog";
import { EditServiceDialog } from "@/components/services/edit-service-dialog";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Services · SlotBook",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add the services clients can book.
          </p>
        </div>
        <AddServiceDialog />
      </div>

      <Suspense fallback={<p className="mt-8">Loading…</p>}>
        <ServicesList />
      </Suspense>
    </div>
  );
}

async function ServicesList() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const services = await prisma.service.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
  });

  return (
    <ul className="mt-8 divide-y rounded-lg border">
      {services.map((service) => (
        <li key={service.id} className="flex items-center justify-between p-4">
          <span className="font-medium">{service.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {service.durationMinutes} min · {service.priceCents / 100} UAH
            </span>
            <EditServiceDialog service={service} />
          </div>
        </li>
      ))}
    </ul>
  );
}
