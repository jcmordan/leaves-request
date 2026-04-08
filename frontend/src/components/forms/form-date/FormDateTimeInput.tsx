'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { DatePicker, IDatePickerProps } from '@/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { BaseInputProps } from '../types'

type Props = BaseInputProps<Omit<IDatePickerProps, 'date' | 'onSelect' | 'id'>> & {
  defaultValue?: string
}

export const FormDateTimeInput = ({
  name,
  label,
  required,
  defaultValue,
  disabled,
  ...pickerProps
}: Props) => {
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormDateTimeInput must be used within a FormProvider')
  }

  const { control } = formContext
  const [timeValue, setTimeValue] = useState('')

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      defaultValue={defaultValue}
      render={({ field: { onChange, value }, fieldState }) => {
        const { error, invalid } = fieldState
        const date = value ? new Date(value) : undefined
        const displayTime = date ? format(date, 'HH:mm') : timeValue || ''

        const handleDateSelect = (selectedDate: Date | null) => {
          if (!selectedDate) {
            onChange(undefined)

            return
          }

          // If we have a time value, combine it with the selected date
          if (timeValue) {
            const [hours, minutes] = timeValue.split(':').map(Number)
            selectedDate.setHours(hours || 0, minutes || 0, 0, 0)
          }

          onChange(selectedDate.toISOString())
        }

        const handleTimeChange = (time: string) => {
          setTimeValue(time)
          if (date) {
            const [hours, minutes] = time.split(':').map(Number)
            const newDate = new Date(date)
            newDate.setHours(hours || 0, minutes || 0, 0, 0)
            onChange(newDate.toISOString())
          }
        }

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </FieldLabel>
            <div className='flex w-full gap-2'>
              <DatePicker
                id={name}
                date={date}
                onDateChange={handleDateSelect}
                disabled={disabled}
                className={cn('flex-1', invalid && 'border-destructive')}
                aria-invalid={invalid}
                {...pickerProps}
              />
              <div className='relative flex-1'>
                <Input
                  type='time'
                  value={displayTime}
                  onChange={e => handleTimeChange(e.target.value)}
                  disabled={disabled}
                  className='pl-9'
                  aria-invalid={invalid}
                />
              </div>
            </div>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
