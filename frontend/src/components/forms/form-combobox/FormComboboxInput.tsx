'use client'

import { ComponentProps } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

import { Combobox } from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { MultiCombobox } from '@/components/ui/multi-combobox'

import { BaseInputProps, InputOption } from '../types'

type ComboboxProps = ComponentProps<typeof Combobox>
type MultiComboboxProps = ComponentProps<typeof MultiCombobox>

type Props = BaseInputProps<
  Omit<ComboboxProps, 'value' | 'onValueChange' | 'options'> &
    Omit<MultiComboboxProps, 'value' | 'onValueChange' | 'options'>
> & {
  options: InputOption[]
  enableLocalFilter?: boolean
  loading?: boolean
  onSearch?: (searchTerm: string) => Promise<void>
  minSearchLength?: number
  debounceMs?: number
  multi?: boolean
}

export const FormComboboxInput = ({
  name,
  label,
  required,
  disabled,
  options,
  enableLocalFilter = false,
  loading = false,
  onSearch,
  minSearchLength = 3,
  debounceMs = 300,
  multi = false,
  ...otherProps
}: Props) => {
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("FormComboboxInput must be used within a FormProvider");
  }

  const { control } = formContext;

  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (!onSearch) {
      return;
    }

    if (term.length < minSearchLength) {
      return;
    }

    await onSearch(term);
  }, debounceMs);

  const handleSearchChange = async (searchTerm: string) => {
    if (!onSearch) {
      return;
    }

    await debouncedSearch(searchTerm);
  };

  const shouldUseLocalFilter = enableLocalFilter || !onSearch;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const { error, invalid } = fieldState;

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
            {multi ? (
              <MultiCombobox
                options={options}
                value={field.value ?? []}
                onValueChange={field.onChange}
                onSearchChange={
                  shouldUseLocalFilter ? undefined : handleSearchChange
                }
                disabled={disabled ?? loading}
                searchPlaceholder={
                  onSearch
                    ? `Type at least ${minSearchLength} characters to search...`
                    : "Search..."
                }
                emptyText={loading ? "Loading..." : "No results found."}
                {...otherProps}
              />
            ) : (
              <Combobox
                options={options}
                value={field.value}
                onValueChange={field.onChange}
                onSearchChange={
                  shouldUseLocalFilter ? undefined : handleSearchChange
                }
                disabled={disabled ?? loading}
                searchPlaceholder={
                  onSearch
                    ? `Type at least ${minSearchLength} characters to search...`
                    : "Search..."
                }
                emptyText={loading ? "Loading..." : "No results found."}
                {...otherProps}
              />
            )}
            {invalid && <FieldError errors={error ? [error] : []} />}
          </Field>
        );
      }}
    />
  );
};
