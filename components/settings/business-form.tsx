"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateBusiness } from "@/app/[locale]/(dashboard)/dashboard/settings/actions";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  businessDetailsSchema,
  type BusinessDetailsInput,
} from "@/lib/validations/business";

type BusinessFormProps = {
  // The values saved now. They fill the form when it opens.
  name: string;
  description: string;
};

export function BusinessForm({ name, description }: BusinessFormProps) {
  const t = useT();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessDetailsInput>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: { name, description },
  });

  async function onSubmit(values: BusinessDetailsInput) {
    setServerError(null);
    setSaved(false);

    const result = await updateBusiness(values);
    if (result?.error) {
      setServerError(t(result.error));
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6" noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="business-name">{t("settings.name")}</FieldLabel>
          <Input
            id="business-name"
            autoComplete="organization"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="business-description">
            {t("settings.description")}
          </FieldLabel>
          <Textarea
            id="business-description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-primary">
            {t("settings.saved")}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting && (
            <Loader2 className="animate-spin" aria-hidden="true" />
          )}
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </FieldGroup>
    </form>
  );
}
