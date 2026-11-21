import { Suspense } from "react";

import { BusinessForm } from "@/components/settings/business-form";
import { getCurrentBusiness } from "@/lib/dal";
import { pageTitle } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("meta.settings");

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/settings">) {
  const { t } = await getI18n(params);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("dashboard.nav.settings")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("settings.subtitle")}</p>

      <Suspense fallback={<p className="mt-8">{t("common.loading")}</p>}>
        <BusinessSettings params={params} />
      </Suspense>
    </div>
  );
}

// Reads the business on the server and gives its current values to the form.
async function BusinessSettings({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { t } = await getI18n(params);
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <section className="mt-8 max-w-xl">
      <h2 className="text-lg font-semibold">{t("settings.business")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("settings.businessText")}
      </p>
      <BusinessForm
        name={business.name}
        description={business.description ?? ""}
      />
    </section>
  );
}
