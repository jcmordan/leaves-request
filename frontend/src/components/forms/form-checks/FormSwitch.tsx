'use client'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

import { BaseInputProps } from '../types'

type Props = BaseInputProps

export const FormSwitch = ({ name, label, required, disabled }: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormSwitch must be used within a FormProvider')
  }

  const { control } = formContext

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState

        return (
          <Field data-invalid={invalid}>
            <div className='flex items-center gap-2'>
              <Switch
                id={name}
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-invalid={invalid}
                aria-describedby={error ? `${name}-error` : undefined}
              />
              <FieldLabel htmlFor={name} className='cursor-pointer'>
                {label}
                {required && <span className='text-destructive ml-1'>*</span>}
              </FieldLabel>
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
