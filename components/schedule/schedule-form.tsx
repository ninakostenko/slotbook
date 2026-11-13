"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { updateSchedule } from "@/app/(dashboard)/dashboard/schedule/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeSelect } from "@/components/schedule/time-select";
import { weekDays } from "@/lib/time";
import {
  scheduleSchema,
  type ScheduleInput,
} from "@/lib/validations/onboarding";

type ScheduleFormProps = {
  days: ScheduleInput["days"]; // 7 днів, Monday first, з бази
};

export function ScheduleForm({ days: savedDays }: ScheduleFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { days: savedDays },
  });

  const days = useWatch({ control, name: "days" });

  async function onSubmit(values: ScheduleInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateSchedule(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
  }

  const daysError = errors.days?.message ?? errors.days?.root?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-8 max-w-xl"
    >
      <div className="flex flex-col gap-1 rounded-lg border px-4">
        {weekDays.map(({ label }, index) => {
          const enabled = days[index]?.enabled ?? false;
          const endError = errors.days?.[index]?.end;
          return (
            <div
              key={label}
              className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-b py-2 last:border-b-0"
            >
              <label className="flex w-32 items-center gap-2 text-sm font-medium">
                <Controller
                  control={control}
                  name={`days.${index}.enabled`}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                {label}
              </label>

              {enabled ? (
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`days.${index}.start`}
                    render={({ field }) => (
                      <TimeSelect
                        value={field.value}
                        onChange={field.onChange}
                        aria-label={`${label} start`}
                      />
                    )}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Controller
                    control={control}
                    name={`days.${index}.end`}
                    render={({ field }) => (
                      <TimeSelect
                        value={field.value}
                        onChange={field.onChange}
                        aria-label={`${label} end`}
                        invalid={!!endError}
                      />
                    )}
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}

              {endError && (
                <p role="alert" className="w-full text-sm text-destructive">
                  {endError.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {daysError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {daysError}
        </p>
      )}
      {serverError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="animate-spin" aria-hidden="true" />
          )}
          {isSubmitting ? "Saving…" : "Save schedule"}
        </Button>
        {saved && (
          <p className="text-sm text-muted-foreground">Schedule saved</p>
        )}
      </div>
    </form>
  );
}
