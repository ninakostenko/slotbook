"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createService } from "@/app/[locale]/(dashboard)/dashboard/services/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { serviceSchema, type ServiceInput } from "@/lib/validations/onboarding";

export function AddServiceDialog() {
  const [open, setOpen] = useState(false); // чи відкрите вікно
  const t = useT();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", durationMinutes: 60, price: Number.NaN },
  });

  async function onSubmit(values: ServiceInput) {
    setServerError(null);

    const result = await createService(values);

    if (result?.error) {
      setServerError(t(result.error));
      return;
    }

    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          {t("services.add")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("services.newTitle")}</DialogTitle>
          <DialogDescription>{t("services.newDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="service-name">
                {t("services.name")}
              </FieldLabel>
              <Input
                id="service-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.durationMinutes}>
              <FieldLabel htmlFor="service-duration">
                {t("services.duration")}
              </FieldLabel>
              <Input
                id="service-duration"
                type="number"
                inputMode="numeric"
                min={5}
                step={5}
                aria-invalid={!!errors.durationMinutes}
                {...register("durationMinutes", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[errors.durationMinutes]} />
            </Field>

            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="service-price">
                {t("services.price")}
              </FieldLabel>
              <Input
                id="service-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="500"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.price]} />
            </Field>

            {serverError && (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {isSubmitting ? t("common.saving") : t("services.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
