"use client";

import { useEffect, useMemo, memo } from "react";
import { useFormContext } from "react-hook-form";
import { FormComboboxInput } from "@/components/forms";
import { FragmentType, useFragment } from "@/__generated__";
import { FormSection } from "./FormSection";
import { useTranslations } from "next-intl";
import { useJobTitleSearch } from "../hooks/useJobTitleSearch";
import { useCompanySearch } from "../hooks/useCompanySearch";
import { useDepartmentSearch } from "../hooks/useDepartmentSearch";
import { useDepartmentSectionSearch } from "../hooks/useDepartmentSectionSearch";
import { useServerSideSearch } from "@/hooks/useServerSideSearch";
import { useCallback } from "react";
import { mergeSearchOptions } from "@/components/forms/helpers";
import { EMPLOYEE_ENTITIES_INFO_FRAGMENT } from "../../graphql/EmployeeQueries";



/**
 * Props for the RolePlacementSection component.
 */
interface RolePlacementSectionProps {
  /** Reference to the employee basic info fragment. */
  employeeRef: FragmentType<typeof EMPLOYEE_ENTITIES_INFO_FRAGMENT>;
}

/**
 * Form section for employee role, company, and department placement.
 * Component handles its own data mapping from fragments to option arrays.
 *
 * @param {RolePlacementSectionProps} props - The component props.
 * @returns {JSX.Element} The rendered RolePlacementSection component.
 */
export const RolePlacementSection = memo(({
  employeeRef,
}: RolePlacementSectionProps) => {
  const { watch } = useFormContext();
  const selectedDepartmentId = watch("departmentId");
  const tc = useTranslations("common");
  const employee = useFragment(EMPLOYEE_ENTITIES_INFO_FRAGMENT, employeeRef);

  const jobTitleSearch = useJobTitleSearch();
  const {
    options: searchedJobTitleOptions,
    loading: jobTitlesLoading,
    onSearch: onJobTitleSearch,
    triggerInitialSearch: triggerJobTitleInitialSearch,
  } = useServerSideSearch(jobTitleSearch, 3);

  const companySearch = useCompanySearch();
  const {
    options: searchedCompanyOptions,
    loading: companiesLoading,
    onSearch: onCompanySearch,
    triggerInitialSearch: triggerCompanyInitialSearch,
  } = useServerSideSearch(companySearch, 3);

  const departmentSearch = useDepartmentSearch();
  const {
    options: searchedDepartmentOptions,
    loading: departmentsLoading,
    onSearch: onDepartmentSearch,
    triggerInitialSearch: triggerDepartmentInitialSearch,
  } = useServerSideSearch(departmentSearch, 3);

  const departmentSectionSearch = useDepartmentSectionSearch();
  const wrappedDepartmentSectionSearch = useCallback(
    (searchTerm: string, after?: string) =>
      departmentSectionSearch(searchTerm, selectedDepartmentId, after),
    [departmentSectionSearch, selectedDepartmentId]
  );

  const {
    options: searchedDepartmentSectionOptions,
    loading: departmentSectionsLoading,
    onSearch: onDepartmentSectionSearch,
    triggerInitialSearch: triggerDepartmentSectionInitialSearch,
  } = useServerSideSearch(wrappedDepartmentSectionSearch, 3);

  useEffect(() => {
    const triggers = [
      triggerJobTitleInitialSearch(),
      triggerCompanyInitialSearch(),
      triggerDepartmentInitialSearch(),
    ];
    Promise.all(triggers).catch(() => {});
  }, [
    triggerJobTitleInitialSearch,
    triggerCompanyInitialSearch,
    triggerDepartmentInitialSearch,
  ]);

  useEffect(() => {
    if (selectedDepartmentId) {
      triggerDepartmentSectionInitialSearch().catch(() => {});
    }
  }, [selectedDepartmentId, triggerDepartmentSectionInitialSearch]);

  const finalJobTitleOptions = useMemo(
    () => mergeSearchOptions(searchedJobTitleOptions, employee?.jobTitle),
    [employee, searchedJobTitleOptions]
  );

  const finalCompanyOptions = useMemo(
    () => mergeSearchOptions(searchedCompanyOptions, employee?.company),
    [employee, searchedCompanyOptions]
  );

  const finalDepartmentOptions = useMemo(
    () => mergeSearchOptions(searchedDepartmentOptions, employee?.department),
    [employee, searchedDepartmentOptions]
  );

  const finalDepartmentSectionOptions = useMemo(
    () =>
      mergeSearchOptions(
        searchedDepartmentSectionOptions,
        employee?.departmentSection as { id: string; name: string } | null,
        !selectedDepartmentId ||
          employee?.department?.id === selectedDepartmentId
      ),
    [employee, selectedDepartmentId, searchedDepartmentSectionOptions]
  );

  return (
    <FormSection title="Role & Placement">
      <div className="grid grid-cols-2 gap-4">
        <FormComboboxInput
          name="jobTitleId"
          label={tc("role")}
          options={finalJobTitleOptions}
          loading={jobTitlesLoading}
          onSearch={onJobTitleSearch}
          minSearchLength={3}
          required
        />

        <FormComboboxInput
          name="companyId"
          label={tc("company")}
          options={finalCompanyOptions}
          loading={companiesLoading}
          onSearch={onCompanySearch}
          minSearchLength={3}
          required
        />

        <FormComboboxInput
          name="departmentId"
          label={tc("department")}
          options={finalDepartmentOptions}
          loading={departmentsLoading}
          onSearch={onDepartmentSearch}
          minSearchLength={3}
          required
        />

        <FormComboboxInput
          name="departmentSectionId"
          label="Dept Section"
          options={finalDepartmentSectionOptions}
          loading={departmentSectionsLoading}
          onSearch={onDepartmentSectionSearch}
          minSearchLength={3}
          disabled={
            !selectedDepartmentId || finalDepartmentSectionOptions.length === 0
          }
        />
      </div>
    </FormSection>
  );
});

RolePlacementSection.displayName = "RolePlacementSection";
