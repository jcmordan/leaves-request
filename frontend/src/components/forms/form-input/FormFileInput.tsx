"use client";

import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { BaseInputProps } from "../types";

/**
 * Props for the FormFileInput component.
 * Includes base input props and specific parametrization for display.
 */
type Props = BaseInputProps & {
  /** Text to display when the input is empty (e.g., "Click to upload") */
  text?: string;
  /** Description text for the maximum file size (e.g., "Max 5MB") */
  maxSize?: string;
  /** Accepted file types (e.g., ".pdf,.jpg,.png") */
  accept?: string;
};

/**
 * A reusable file input component compatible with react-hook-form.
 * Displays a premium upload area when empty and the filename with a clear button when a file is selected.
 */
export const FormFileInput = ({
  name,
  label,
  required,
  disabled,
  text,
  maxSize,
  accept,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormFileInput must be used within a FormProvider");
  }

  const { control } = formContext;

  const handleContainerClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState: { error, invalid } }) => {
        const file = field.value as File | null;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            field.onChange(selectedFile);
          }
          // Reset native input value to allow re-selecting the same file if cleared
          e.target.value = "";
        };

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange(null);
        };

        return (
          <Field id={`${name}-field`} data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>

            <input
              ref={fileInputRef}
              type="file"
              id={name}
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={disabled}
            />

            <div
              onClick={handleContainerClick}
              className={cn(
                "relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden",
                file
                  ? "border-primary/20 bg-primary/5 p-4 flex items-center justify-between"
                  : "border-outline-variant/30 bg-white/50 p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white hover:border-primary/40",
                invalid && "border-destructive/50 bg-destructive/5",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              {file ? (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <IconFile size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate max-w-[250px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
                    title="Clear selection"
                  >
                    <IconX size={16} stroke={2.5} />
                  </button>
                </>
              ) : (
                <>
                  <IconUpload className="text-on-surface-variant/50" size={24} />
                  <div>
                    <p className="text-xs font-semibold text-primary">{text}</p>
                    {maxSize && (
                      <p className="text-[10px] text-on-surface-variant">
                        {maxSize}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
