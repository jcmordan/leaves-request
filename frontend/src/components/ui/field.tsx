"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@/lib/utils";

const Field = FieldPrimitive.Root;

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  errors,
  ...props
}: FieldPrimitive.Error.Props & { errors?: { message?: string }[] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("mt-1.5 text-xs font-medium text-destructive", className)}
      {...props}
    >
      {errors.map((error, i) => (
        <div key={i}>{error.message}</div>
      ))}
    </FieldPrimitive.Error>
  );
}

export { Field, FieldLabel, FieldError };
