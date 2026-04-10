"use client";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import { BaseInputProps } from "../types";
import { cn } from "@/lib/utils";

type Props = BaseInputProps & { labelPosition: "top" | "left" | "right" };

export const FormSwitch = ({
  name,
  label,
  required,
  disabled,
  labelPosition = "top",
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormSwitch must be used within a FormProvider");
  }

  const { control } = formContext;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;

        return (
          <Field data-invalid={invalid}>
            <div
              className={cn(
                "flex gap-2 items-center text-left",
                labelPosition === "top" && "flex-col-reverse items-start gap-1",
                labelPosition === "left" && "flex-row-reverse justify-end",
              )}
            >
              <Switch
                id={name}
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-invalid={invalid}
                aria-describedby={error ? `${name}-error` : undefined}
              />
              <FieldLabel
                htmlFor={name}
                className={cn(
                  "cursor-pointer",
                  labelPosition === "top" && "mb-1",
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
