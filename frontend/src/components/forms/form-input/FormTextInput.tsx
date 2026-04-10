'use client'

import { ChangeEvent, ComponentProps, ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { BaseInputProps } from '../types'

type MaskType = 'number' | 'currency' | 'integer' | 'percentage' | RegExp

type Props = BaseInputProps<ComponentProps<typeof Input>> &
  Partial<Pick<ComponentProps<typeof Controller>, "rules">> & {
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    mask?: MaskType;
  };

const applyMask = (value: string, mask: MaskType): string => {
  if (!mask) {
    return value
  }

  // Pre-built masks
  if (mask === 'number') {
    // Allow numbers with optional decimal point
    return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  }

  if (mask === 'integer') {
    // Allow only integers
    return value.replace(/\D/g, '')
  }

  if (mask === 'currency') {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

    // Split into integer and decimal parts
    const parts = cleaned.split('.')

    // Format integer part with thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // Limit decimal places to 2
    if (parts[1]) {
      parts[1] = parts[1].substring(0, 2)
    }

    return parts.join('.')
  }

  if (mask === 'percentage') {
    // Allow only integers between 0 and 100
    const cleaned = value.replace(/\D/g, '')
    const num = parseInt(cleaned, 10)

    if (isNaN(num)) {
      return ''
    }

    if (num > 100) {
      return '100'
    }

    return String(num)
  }

  // Custom regex mask
  if (mask instanceof RegExp) {
    const matches = value.match(mask)

    return matches ? matches[0] : ''
  }

  return value
}

const unmaskValue = (value: string, mask: MaskType): string => {
  if (mask === 'currency') {
    // Remove thousand separators for storage
    return value.replace(/,/g, '')
  }

  return value
}

export const FormTextInput = ({
  name,
  label,
  required,
  type,
  rules,
  defaultValue,
  disabled,
  endAdornment,
  startAdornment,
  mask,
  ...otherProps
}: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormTextInput must be used within a FormProvider')
  }

  const { control } = formContext

  if (!control) {
    throw new Error('FormTextInput control is not available')
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ ...rules, required }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value

          if (mask) {
            const maskedValue = applyMask(inputValue, mask)
            const unmaskedValue = unmaskValue(maskedValue, mask)

            // Update the field with unmasked value for form state
            field.onChange(unmaskedValue)
          } else {
            field.onChange(inputValue)
          }
        }

        const handleBlur = () => {
          if (mask === 'currency' && field.value) {
            const val = String(field.value)
            const parts = val.split('.')
            const decimal = (parts[1] || '').padEnd(2, '0').substring(0, 2)
            const formatted = `${parts[0] || '0'}.${decimal}`
            field.onChange(formatted)
          }
          field.onBlur()
        }

        // Display masked value
        const displayValue =
          mask && field.value ? applyMask(String(field.value), mask) : (field.value ?? '')

        return (
          <Field id={`${name}-field`} data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            <div className="relative">
              {startAdornment && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {startAdornment}
                </div>
              )}
              <Input
                {...field}
                id={name}
                type={type}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                aria-invalid={invalid}
                aria-describedby={error ? `${name}-error` : undefined}
                className={cn(
                  startAdornment && "pl-8",
                  endAdornment && "pr-12",
                  "bg-muted"
                )}
                {...otherProps}
              />
              {endAdornment && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {endAdornment}
                </div>
              )}
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  )
}
