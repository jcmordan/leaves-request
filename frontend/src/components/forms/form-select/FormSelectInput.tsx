'use client'

import { ComponentProps } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { BaseInputProps, InputOption } from '../types'

type Props = BaseInputProps<
  Omit<ComponentProps<typeof SelectTrigger>, 'value' | 'defaultValue'>
> & {
  options: InputOption[]
  position?: 'popper' | 'item-aligned'
}

export const FormSelectInput = ({
  name,
  label,
  options,
  required,
  disabled,
  position = 'item-aligned',
  ...otherProps
}: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormSelectInput must be used within a FormProvider')
  }

  const { control } = formContext

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState
        const selectedOption = options.find(o => o.value === field.value)
        const EMPTY_VALUE = '__empty__'
        const selectValue =
          selectedOption?.value !== null && selectedOption?.value !== undefined
            ? String(selectedOption.value)
            : EMPTY_VALUE

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </FieldLabel>
            <Select
              value={selectValue}
              onValueChange={(value: string) => {
                if (value === EMPTY_VALUE) {
                  field.onChange(undefined)

                  return
                }

                const option = options.find(o => String(o.value) === value)
                field.onChange(option?.value ?? undefined)
              }}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                aria-invalid={invalid}
                aria-describedby={error ? `${name}-error` : undefined}
                {...otherProps}
              >
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent position={position}>
                {options.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
