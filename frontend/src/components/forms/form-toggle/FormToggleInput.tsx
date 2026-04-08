'use client'
import React, { ComponentProps } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { BaseInputProps, InputOption } from '../types'

type Props = BaseInputProps<ComponentProps<typeof ToggleGroup>> &
  Pick<ComponentProps<typeof Controller>, 'rules'> & {
    options: Array<InputOption & { icon?: React.ReactNode }>
  }

export const FormToggleInput = ({
  name,
  label,
  options,
  required,
  disabled,
  variant = 'outline',
  size,
  spacing = 2,
  rules,
  ...restProps
}: Props) => {
  const {
    type,
    value: _value,
    onValueChange: _onValueChange,
    defaultValue: _defaultValue,
    ...props
  } = restProps as ComponentProps<typeof ToggleGroup>
  const formContext = useFormContext()

  if (!formContext) {
    throw new Error('FormToggleInput must be used within a FormProvider')
  }

  const { control } = formContext

  const validationRules = {
    ...rules,
    required: rules?.required ?? (required ? 'This field is required' : false),
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={validationRules}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState

        const convertToString = (value: string | number): string => {
          return String(value)
        }

        const isMultiple = type === 'multiple' || Array.isArray(field.value)

        const commonProps = {
          disabled,
          variant,
          size,
          spacing,
          id: name,
          'aria-invalid': invalid,
          'aria-describedby': error ? `${name}-error` : undefined,
          ...props,
        }

        const toggleItems = options.map(option => (
          <ToggleGroupItem
            key={option.value}
            value={convertToString(option.value)}
            aria-label={option.label}
            disabled={option.disabled}
          >
            {option.label}
            {option.icon}
          </ToggleGroupItem>
        ))

        const handleMultipleChange = (values: string[]) => {
          const newValues = options
            .filter(option => values.includes(convertToString(option.value)))
            .map(option => option.value)
          field.onChange(newValues)
        }

        const handleSingleChange = (value: string) => {
          if (value === '') {
            field.onChange(undefined)
          } else {
            const option = options.find(opt => convertToString(opt.value) === value)
            if (option) {
              field.onChange(option.value)
            }
          }
        }

        const value = isMultiple
          ? (Array.isArray(field.value) ? field.value : []).map(convertToString)
          : field.value === undefined || field.value === null
            ? ''
            : convertToString(field.value)

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </FieldLabel>

            {/* @ts-expect-error - dynamic type switching for DRYness */}
            <ToggleGroup
              {...commonProps}
              type={type}
              variant='default'
              spacing={2}
              size='sm'
              className='flex justify-start'
              value={value as any}
              onValueChange={isMultiple ? handleMultipleChange : handleSingleChange}
            >
              {toggleItems}
            </ToggleGroup>
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        )
      }}
    />
  )
}
