"use client";
import { ChangeEvent, ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { BaseInputProps } from "../types";


type Props = BaseInputProps<ComponentProps<typeof Input>> &
  Pick<ComponentProps<typeof Controller>, "rules"> & {
    prefix?: string;
    format?: "number" | "currency";
    allowDecimal?: boolean;
  };

export const FormNumberInput = ({
  name,
  label,
  required,
  rules,
  defaultValue,
  disabled,
  prefix,
  format = "number",
  allowDecimal = false,
  ...otherProps
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormNumberInput must be used within a FormProvider");
  }

  const { control } = formContext;

  const handleChange =
    (onChange: (...event: any[]) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = event.target.value
        .toString()
        .split(",")
        .join("")
        .replace(prefix ?? "", "");

      onChange(event);
    };

  // Extract type from otherProps since NumericFormat only accepts "text" | "tel" | "password"
  const { type: _type, ...restProps } = otherProps;

  const formatProps = allowDecimal
    ? { decimalScale: 2, decimalSeparator: "." }
    : {};

  return (
    <Controller
      name={name}
      control={control}
      rules={{ ...rules, required }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            <NumericFormat
              id={name}
              value={field.value}
              onChange={handleChange(field.onChange)}
              customInput={Input}
              thousandSeparator
              fixedDecimalScale
              prefix={prefix}
              valueIsNumericString={false}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={error ? `${name}-error` : undefined}
              className="bg-muted"
              {...formatProps}
              {...restProps}
            />
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
