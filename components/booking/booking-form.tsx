"use client";

import { createBooking } from "@/app/[locale]/book/[slug]/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  clientDetailsSchema,
  type ClientDetailsInput,
} from "@/lib/validations/booking";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type BookingFormProps = {
  slug: string;
  // These three come from the page, not from the client. They go to the server action as they are.
  serviceId: string;
  date: string; // "2026-12-01"
  time: number; // minutes from midnight
  available: boolean; // false when the chosen time is not free (any more)
  summary: string; // for example "Massage · Thu, 3 Dec · 10:00"
};

export function BookingForm({
  slug,
  serviceId,
  date,
  time,
  available,
  summary,
}: BookingFormProps) {
  const t = useT();
  const [serverError, setServerError] = useState<string | null>(null);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientDetailsInput>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: { clientName: "", clientEmail: "" },
  });

  async function onSubmit(values: ClientDetailsInput) {
    setServerError(null);

    const result = await createBooking(slug, {
      ...values,
      serviceId,
      date,
      time,
    });
    if (!result.ok) {
      setServerError(t(result.error));
      return;
    }
    setBookedId(result.bookingId);
    // The confirmation page has the details and the link to cancel.
    router.push(`/booking/${result.cancelToken}`);
  }

  if (!bookedId && !available) {
    return (
      <p
        id="your-details"
        role="status"
        className="mt-6 scroll-mt-8 rounded-2xl border bg-card p-6 text-center"
      >
        {t("book.unavailable")}
      </p>
    );
  }

  if (bookedId) {
    return (
      <p
        role="status"
        className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center font-medium text-primary"
      >
        {t("book.booked")}
      </p>
    );
  }

  return (
    <form
      id="your-details"
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 scroll-mt-6 rounded-2xl border bg-card p-6 shadow-sm"
      noValidate
    >
      <h2 className="font-display text-2xl font-semibold">
        {t("book.enterDetails")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      <FieldGroup className="mt-3">
        <Field data-invalid={!!errors.clientName}>
          <FieldLabel htmlFor="clientName">{t("book.name")}</FieldLabel>
          <Input
            id="clientName"
            autoComplete="name"
            aria-invalid={!!errors.clientName}
            {...register("clientName")}
          />
          <FieldError errors={[errors.clientName]} />
        </Field>
        <Field data-invalid={!!errors.clientEmail}>
          <FieldLabel htmlFor="clientEmail">{t("book.email")}</FieldLabel>
          <Input
            id="clientEmail"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.clientEmail}
            {...register("clientEmail")}
          />
          <FieldError errors={[errors.clientEmail]} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("book.booking") : t("book.book")}
        </Button>
      </FieldGroup>
    </form>
  );
}
