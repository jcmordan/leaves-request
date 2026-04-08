'use client'

import { Controller, useFormContext } from 'react-hook-form'

import { DatePicker, IDatePickerProps } from '@/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

import { BaseInputProps } from '../types'

type Props = BaseInputProps<Omit<IDatePickerProps, 'date' | 'onDateChange' | 'id'>> & {
  defaultValue?: string
}

export const FormDateInput = ({
  name,
  label,
  required,
  defaultValue,
  disabled,
  ...pickerProps
}: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormDateInput must be used within a FormProvider')
  }

  const { control } = formContext

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState

        // Convert value to Date, handling both string and Date formats
        let date: Date | undefined = undefined
        if (field.value) {
          if (field.value instanceof Date) {
            date = field.value
          } else if (typeof field.value === 'string') {
            const parsedDate = new Date(field.value)
            // Check if the date is valid
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate
            }
          }
        }

        const handleDateChange = (selectedDate: Date | null): void => {
          if (selectedDate) {
            // Store date as ISO string
            field.onChange(selectedDate.toISOString())
          } else {
            field.onChange(undefined)
          }
        }

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </FieldLabel>
            <DatePicker
              id={name}
              date={date}
              onDateChange={handleDateChange}
              disabled={disabled}
              className={cn(invalid && 'border-destructive')}
              aria-invalid={invalid}
              aria-describedby={error ? `${name}-error` : undefined}
              {...pickerProps}
            />
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
