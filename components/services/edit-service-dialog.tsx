"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateService } from "@/app/(dashboard)/dashboard/services/actions";
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

type EditServiceDialogProps = {
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
  };
};

export function EditServiceDialog({ service }: EditServiceDialogProps) {
  const [open, setOpen] = useState(false); // чи відкрите вікно
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.priceCents / 100,
    },
  });

  async function onSubmit(values: ServiceInput) {
    setServerError(null);

    const result = await updateService(service.id, values);

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${service.name}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit service</DialogTitle>
          <DialogDescription>Changes apply to new bookings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor={`edit-name-${service.id}`}>
                Service name
              </FieldLabel>
              <Input
                id={`edit-name-${service.id}`}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.durationMinutes}>
              <FieldLabel htmlFor={`edit-duration-${service.id}`}>
                Duration (minutes)
              </FieldLabel>
              <Input
                id={`edit-duration-${service.id}`}
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
              <FieldLabel htmlFor={`edit-price-${service.id}`}>
                Price (UAH)
              </FieldLabel>
              <Input
                id={`edit-price-${service.id}`}
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
