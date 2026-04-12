"use client";
import { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { BaseInputProps } from "../types";

type Props = BaseInputProps<ComponentProps<typeof Textarea>> & {
  placeholder?: string;
};

export const FormTextArea = ({
  name,
  label,
  required,
  defaultValue,
  disabled,
  ...otherProps
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormTextArea must be used within a FormProvider");
  }

  const { control } = formContext;

  if (!control) {
    throw new Error("FormTextArea control is not available");
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? "Field is required" : undefined }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            <Textarea
              {...field}
              id={name}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={error ? `${name}-error` : undefined}
              {...otherProps}
            />
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
