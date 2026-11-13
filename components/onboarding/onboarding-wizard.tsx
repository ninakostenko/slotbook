"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";

import { completeOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TimeSelect } from "@/components/schedule/time-select";
import { weekDays } from "@/lib/time";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validations/onboarding";

const steps: {
  title: string;
  description: string;
  fields: FieldPath<OnboardingInput>[];
}[] = [
  {
    title: "Your business",
    description: "This is what clients see on your booking page.",
    fields: ["business.name", "business.slug"],
  },
  {
    title: "Your first service",
    description: "You can add more services later.",
    fields: ["service.name", "service.durationMinutes", "service.price"],
  },
  {
    title: "Working hours",
    description: "Clients can only book inside these hours.",
    fields: ["schedule.days"],
  },
];

// "Anna's Studio" -> "annas-studio". Non-Latin letters are dropped,
// so the owner can still type the link by hand.
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [slugEdited, setSlugEdited] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business: { name: "", slug: "" },
      service: { name: "", durationMinutes: 60, price: Number.NaN },
      schedule: {
        days: weekDays.map(({ dayOfWeek }) => ({
          dayOfWeek,
          enabled: dayOfWeek >= 1 && dayOfWeek <= 5, // Monday to Friday
          start: "09:00",
          end: "18:00",
        })),
      },
    },
  });

  const isLastStep = step === steps.length - 1;
  const current = steps[step]!;
  const slug = useWatch({ control, name: "business.slug" });
  const days = useWatch({ control, name: "schedule.days" });

  // Validate only the fields of the current step before moving on.
  async function goNext() {
    const valid = await trigger(current.fields);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(values: OnboardingInput) {
    setServerError(null);
    const result = await completeOnboarding(values);

    // On success the action redirects to /dashboard, so we only get here on errors.
    if (result?.field) {
      setError(result.field, { message: result.error });
      setStep(0);
    } else if (result) {
      setServerError(result.error);
    }
  }

  // Enter in a field moves to the next step instead of submitting early.
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (isLastStep) return handleSubmit(onSubmit)(event);
    event.preventDefault();
    void goNext();
  }

  const daysError =
    errors.schedule?.days?.message ?? errors.schedule?.days?.root?.message;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <p className="text-sm font-medium text-primary">
          Step {step + 1} of {steps.length}
        </p>
        <CardTitle className="text-xl">{current.title}</CardTitle>
        <CardDescription>{current.description}</CardDescription>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {steps.map((s, index) => (
            <span
              key={s.title}
              className={
                index <= step
                  ? "h-1.5 flex-1 rounded-full bg-primary"
                  : "h-1.5 flex-1 rounded-full bg-muted"
              }
            />
          ))}
        </div>
      </CardHeader>

      <form onSubmit={handleFormSubmit} noValidate>
        <CardContent>
          {step === 0 && (
            <FieldGroup>
              <Field data-invalid={!!errors.business?.name}>
                <FieldLabel htmlFor="business-name">Business name</FieldLabel>
                <Input
                  id="business-name"
                  placeholder="Anna's Studio"
                  aria-invalid={!!errors.business?.name}
                  {...register("business.name", {
                    onChange: (event) => {
                      if (!slugEdited) {
                        setValue("business.slug", slugify(event.target.value));
                      }
                    },
                  })}
                />
                <FieldError errors={[errors.business?.name]} />
              </Field>

              <Field data-invalid={!!errors.business?.slug}>
                <FieldLabel htmlFor="business-slug">
                  Booking page link
                </FieldLabel>
                <Input
                  id="business-slug"
                  placeholder="anna-studio"
                  aria-invalid={!!errors.business?.slug}
                  {...register("business.slug", {
                    onChange: () => setSlugEdited(true),
                  })}
                />
                <FieldDescription>
                  Your page: slotbook.app/book/{slug || "your-link"}
                </FieldDescription>
                <FieldError errors={[errors.business?.slug]} />
              </Field>
            </FieldGroup>
          )}

          {step === 1 && (
            <FieldGroup>
              <Field data-invalid={!!errors.service?.name}>
                <FieldLabel htmlFor="service-name">Service name</FieldLabel>
                <Input
                  id="service-name"
                  placeholder="Haircut"
                  aria-invalid={!!errors.service?.name}
                  {...register("service.name")}
                />
                <FieldError errors={[errors.service?.name]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.service?.durationMinutes}>
                  <FieldLabel htmlFor="service-duration">
                    Duration (minutes)
                  </FieldLabel>
                  <Input
                    id="service-duration"
                    type="number"
                    inputMode="numeric"
                    min={5}
                    step={5}
                    aria-invalid={!!errors.service?.durationMinutes}
                    {...register("service.durationMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  <FieldError errors={[errors.service?.durationMinutes]} />
                </Field>

                <Field data-invalid={!!errors.service?.price}>
                  <FieldLabel htmlFor="service-price">Price (UAH)</FieldLabel>
                  <Input
                    id="service-price"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="500"
                    aria-invalid={!!errors.service?.price}
                    {...register("service.price", { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.service?.price]} />
                </Field>
              </div>
            </FieldGroup>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-1">
              {weekDays.map(({ label }, index) => {
                const enabled = days[index]?.enabled ?? false;
                const endError = errors.schedule?.days?.[index]?.end;
                return (
                  <div
                    key={label}
                    className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-b py-2 last:border-b-0"
                  >
                    <label className="flex w-32 items-center gap-2 text-sm font-medium">
                      <Controller
                        control={control}
                        name={`schedule.days.${index}.enabled`}
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
                          name={`schedule.days.${index}.start`}
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
                          name={`schedule.days.${index}.end`}
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
                      <span className="text-sm text-muted-foreground">
                        Closed
                      </span>
                    )}

                    {endError && (
                      <p
                        role="alert"
                        className="w-full text-sm text-destructive"
                      >
                        {endError.message}
                      </p>
                    )}
                  </div>
                );
              })}
              {daysError && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {daysError}
                </p>
              )}
            </div>
          )}

          {serverError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {serverError}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6 justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="animate-spin" aria-hidden="true" />
            )}
            {isLastStep
              ? isSubmitting
                ? "Saving…"
                : "Finish setup"
              : "Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
