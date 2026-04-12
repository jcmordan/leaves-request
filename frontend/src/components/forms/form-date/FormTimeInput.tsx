import { ClockIcon } from "lucide-react";
import { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { BaseInputProps } from "../types";

type Props = BaseInputProps<ComponentProps<typeof Input>>;

export const FormTimeInput = ({
  name,
  label,
  required,
  disabled,
  ...pickerProps
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormTimeInput must be used within a FormProvider");
  }

  const { control } = formContext;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;
        // Format value for time input (HH:mm)
        const timeValue = field.value
          ? typeof field.value === "string"
            ? field.value.substring(0, 5) // Extract HH:mm from ISO string if needed
            : field.value
          : "";

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                id={name}
                type="time"
                value={timeValue}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={disabled}
                className="pl-9"
                aria-invalid={invalid}
                aria-describedby={error ? `${name}-error` : undefined}
                {...pickerProps}
              />
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
