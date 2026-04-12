"use client";
import React, { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { BaseInputProps, InputOption } from "../types";

export type RichInputOption = InputOption & {
  icon?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
};

type Props = BaseInputProps<{
  options: RichInputOption[];
}> &
  Pick<ComponentProps<typeof Controller>, "rules">;

export const FormRichRadioGroup = ({
  name,
  label,
  required,
  options,
  disabled,
  rules,
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormRichRadioGroup must be used within a FormProvider");
  }

  const { control } = formContext;

  const validationRules = {
    ...rules,
    required: rules?.required ?? (required ? "This field is required" : false),
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={validationRules}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            <RadioGroup
              value={field.value?.toString() ?? ""}
              onValueChange={field.onChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
              disabled={disabled}
            >
              {options.map((option) => {
                const isSelected =
                  field.value?.toString() === option.value.toString();

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "grid gap-4",
                      isSelected && option.children
                        ? "col-span-full grid-cols-1 md:grid-cols-2"
                        : "col-span-1 grid-cols-1",
                    )}
                  >
                    <label
                      htmlFor={`${name}-${option.value}`}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                        "hover:bg-accent/50",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-muted bg-card hover:border-muted-foreground/30",
                        (disabled ?? option.disabled) &&
                          "opacity-50 cursor-not-allowed hover:bg-transparent",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {option.icon && (
                          <div
                            className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-lg border shadow-xs transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/50 text-muted-foreground border-transparent",
                            )}
                          >
                            {option.icon}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`${name}-${option.value}`}
                        className={cn(
                          "transition-transform duration-200",
                          isSelected && "scale-110",
                        )}
                        disabled={disabled ?? option.disabled}
                      />
                    </label>
                    {isSelected && option.children}
                  </div>
                );
              })}
            </RadioGroup>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
