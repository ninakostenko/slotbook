"use client";

import { useOptimistic, useState, useTransition } from "react";

import { setServiceActive } from "@/app/(dashboard)/dashboard/services/actions";
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
        setError(result.error);
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
        aria-label={`Show ${serviceName} to clients`}
      />
    </div>
  );
}
