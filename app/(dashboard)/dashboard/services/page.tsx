import type { Metadata } from "next";
import { Suspense } from "react";

import { AddServiceDialog } from "@/components/services/add-service-dialog";
import { EditServiceDialog } from "@/components/services/edit-service-dialog";
import { ServiceActiveSwitch } from "@/components/services/service-active-switch";
import { Badge } from "@/components/ui/badge";
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
    // By name only, so a row stays in place when its switch is toggled.
    orderBy: [{ name: "asc" }],
  });

  // Empty state: tell the owner what to do instead of showing a blank box.
  if (services.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">No services yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first service so clients can book it.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-8 divide-y rounded-lg border">
      {services.map((service) => (
        <li
          key={service.id}
          className="flex items-center justify-between gap-3 p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={
                  service.isActive
                    ? "truncate font-medium"
                    : "truncate font-medium text-muted-foreground"
                }
              >
                {service.name}
              </span>
              {!service.isActive && <Badge variant="secondary">Hidden</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {service.durationMinutes} min · {service.priceCents / 100} UAH
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <EditServiceDialog service={service} />
            <ServiceActiveSwitch
              serviceId={service.id}
              serviceName={service.name}
              isActive={service.isActive}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
