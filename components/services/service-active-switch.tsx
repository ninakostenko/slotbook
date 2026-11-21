"use client";

import { useOptimistic, useState, useTransition } from "react";

import { setServiceActive } from "@/app/[locale]/(dashboard)/dashboard/services/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Switch } from "@/components/ui/switch";

type ServiceActiveSwitchProps = {
  serviceId: string;
  serviceName: string;
  isActive: boolean;
};

export function ServiceActiveSwitch({
  serviceId,
  serviceName,
  isActive,
}: ServiceActiveSwitchProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Optimistic update: the switch flips at once, before the server answers.
  // When the action finishes, the page re-renders with the real value from the database.
  // If the action fails, React drops the optimistic value and the switch flips back.
  const [optimisticActive, setOptimisticActive] = useOptimistic(isActive);

  function handleChange(checked: boolean) {
    setError(null);
    startTransition(async () => {
      setOptimisticActive(checked);
      const result = await setServiceActive(serviceId, checked);
      if (result?.error) {
        setError(t(result.error));
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
      <Switch
        checked={optimisticActive}
        onCheckedChange={handleChange}
        disabled={isPending}
        aria-label={t("services.showToClients", { name: serviceName })}
      />
    </div>
  );
}
