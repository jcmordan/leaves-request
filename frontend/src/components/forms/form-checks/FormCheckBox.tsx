'use client'

import { Controller, useFormContext } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

import { BaseInputProps } from '../types'

type Props = BaseInputProps & {
  defaultValue?: boolean
  value?: string | number
}

export const FormCheckBox = ({ name, label, required, disabled, defaultValue, value }: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormCheckBox must be used within a FormProvider')
  }

  const { control } = formContext

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      disabled={disabled}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState
        const checkbox = (
          <Checkbox
            id={`${name}-${value ?? ''}`}
            checked={value ? field.value?.includes(value) : (field.value ?? false)}
            onCheckedChange={checked => {
              if (value) {
                return checked
                  ? field.onChange([...(field.value ?? []), value])
                  : field.onChange(field.value?.filter((v: string | number) => v !== value))
              }

              return field.onChange(checked)
            }}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )

        const labelElement = (
          <FieldLabel htmlFor={`${name}-${value ?? ''}`} className='cursor-pointer'>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </FieldLabel>
        )

        return (
          <Field data-invalid={invalid}>
            <div className={cn('flex items-center justify-start gap-2')}>
              {checkbox}
              {labelElement}
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
