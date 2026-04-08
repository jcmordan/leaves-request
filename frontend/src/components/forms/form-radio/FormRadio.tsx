'use client'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { BaseInputProps } from '../types'

type Props = BaseInputProps<{
  options: Array<{ value: string; label: string }>
}>

export const FormRadioGroup = ({ name, label, required, options }: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormRadioGroup must be used within a FormProvider')
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
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </FieldLabel>
            <RadioGroup
              value={field.value?.toString() ?? ''}
              onValueChange={field.onChange}
              id={name}
              aria-invalid={invalid}
              aria-describedby={error ? `${name}-error` : undefined}
              className='flex flex-row gap-6 pt-2'
            >
              {options.map(({ value: optionValue, label: optionLabel }) => {
                return (
                  <div key={optionValue} className='flex items-center space-x-2'>
                    <RadioGroupItem value={optionValue} id={`${name}-${optionValue}`} />
                    <Label
                      htmlFor={`${name}-${optionValue}`}
                      className='cursor-pointer font-normal'
                    >
                      {optionLabel}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
