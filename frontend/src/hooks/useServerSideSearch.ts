import { useCallback, useEffect, useState } from "react";
import { InputOption } from "@/components/forms/types";

type SearchFunction = (
  searchTerm: string,
  after?: string,
) => Promise<{
  items: InputOption[];
  hasNextPage: boolean;
  endCursor?: string | null;
}>;

/**
 * Hook for managing server-side search state.
 *
 * @param {SearchFunction} searchFunction - The function to perform the search.
 * @param {number} minSearchLength - Minimum characters before triggering search.
 * @param {boolean} autoTrigger - Whether to trigger an initial search on mount.
 * @returns {object} Search state and control functions.
 */
export const useServerSideSearch = (
  searchFunction: SearchFunction,
  minSearchLength = 3,
  autoTrigger = false,
) => {
  const [options, setOptions] = useState<InputOption[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(
    async (searchTerm: string, bypassMinLength = false) => {
      if (!bypassMinLength && searchTerm.length < minSearchLength) {
        setOptions([]);

        return;
      }

      setLoading(true);

      try {
        const result = await searchFunction(searchTerm);
        setOptions(result.items);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [searchFunction, minSearchLength],
  );

  const onSearch = useCallback(
    async (searchTerm: string) => {
      await performSearch(searchTerm);
    },
    [performSearch],
  );

  const triggerInitialSearch = useCallback(async () => {
    await performSearch("", true);
  }, [performSearch]);

  const clearOptions = useCallback(() => {
    setOptions([]);
  }, []);

  useEffect(() => {
    if (autoTrigger) {
      const timeoutId = setTimeout(() => {
        triggerInitialSearch().catch(() => {
          // Errors handled internally
        });
      }, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [autoTrigger, triggerInitialSearch]);

  return {
    options,
    loading,
    onSearch,
    triggerInitialSearch,
    clearOptions,
  };
};
