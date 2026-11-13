"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createService } from "@/app/(dashboard)/dashboard/services/actions";
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
      setServerError(result.error);
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
          Add service
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New service</DialogTitle>
          <DialogDescription>
            Clients will see it on your booking page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="service-name">Service name</FieldLabel>
              <Input
                id="service-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.durationMinutes}>
              <FieldLabel htmlFor="service-duration">
                Duration (minutes)
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
              <FieldLabel htmlFor="service-price">Price (UAH)</FieldLabel>
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
              {isSubmitting ? "Saving…" : "Save service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
