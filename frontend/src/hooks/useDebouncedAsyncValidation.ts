"use client";

import { useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

/**
 * A hook that provides a debounced validation function compatible with React Hook Form async validation.
 *
 * This hook wraps a validation function (impl) in a debounced callback, but enables the calling
 * code to await the result of the debounced execution. React Hook Form expects a Promise that resolves
 * to the validation result (true or string), but standard debounce functions return undefined immediately.
 *
 * This implementation uses a Promise architecture where:
 * 1. Calling the returned validator returns a NEW Promise.
 * 2. It schedules the actual validation logic using a debounce mechanism (via useDebouncedCallback or internal).
 * 3. When the debounced logic runs, it resolves the Promise associated with the LATEST call.
 * 4. It resolves previous pending promises as VALID (true) to effectively 'cancel' them without error.
 *
 * @param impl The validation function to debounce. Should return true (valid) or string (error message).
 * @param wait Delay in milliseconds.
 * @returns A validation function compatible with rules.validate.
 */
export const useDebouncedAsyncValidation = <
  T extends (...args: any[]) => Promise<boolean | string>,
>(
  impl: T,
  wait: number,
): ((...args: Parameters<T>) => Promise<boolean | string>) => {
  // We track the promise resolution of the current pending validation
  const debounceRef = useRef<{
    resolve: (value: boolean | string) => void;
  } | null>(null);

  // Use the library's useDebouncedCallback for the actual execution timing
  const debouncedImpl = useDebouncedCallback(
    async (
      resolve: (val: boolean | string) => void,
      ...args: Parameters<T>
    ) => {
      try {
        const result = await impl(...args);
        resolve(result);
      } finally {
        if (debounceRef.current?.resolve === resolve) {
          debounceRef.current = null;
        }
      }
    },
    wait,
  );

  return useCallback(
    (...args: Parameters<T>) => {
      return new Promise<boolean | string>((resolve) => {
        // If there is a pending validation, resolve it as true (valid) to cancel it in the eyes of RHF.
        // This prevents old closures from overriding newer ones or keeping the form isSubmitting/isValidating state stuck
        // if we just never resolved them.
        if (debounceRef.current) {
          debounceRef.current.resolve(true);
        }

        debounceRef.current = { resolve };

        debouncedImpl(resolve, ...args)?.catch(() => {
          // prevent unhandled rejection
        });
      });
    },
    [debouncedImpl],
  );
};
