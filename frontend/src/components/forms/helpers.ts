import uniqBy from "lodash/uniqBy";
import { InputOption } from "./types";

/**
 * Merges a list of searched options with a current entity value.
 * This ensures that the currently selected value is always present in the options list,
 * even if it's not part of the current search results (e.g., when the search term is too specific).
 *
 * @param searchedOptions - The list of options returned by the server-side search.
 * @param currentEntity - The currently selected entity (id and name).
 * @param extraCheck - An optional additional check (e.g., checking if the entity belongs to a selected parent).
 * @returns A deduplicated list of options with the current entity included if applicable.
 */
export const mergeSearchOptions = (
  searchedOptions: InputOption[],
  currentEntity: { id: string; name: string } | null | undefined,
  extraCheck: boolean = true
): InputOption[] => {
  const combined = [...searchedOptions];

  if (
    currentEntity?.id &&
    extraCheck &&
    !combined.some((o) => o.value === currentEntity.id)
  ) {
    combined.unshift({
      label: currentEntity.name,
      value: currentEntity.id,
    });
  }

  return uniqBy(combined, "value");
};
