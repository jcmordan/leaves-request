import { useEffect, useMemo, memo } from "react";
import {
  FormDateInput,
  FormComboboxInput,
  FormSwitch,
} from "@/components/forms";
import { FragmentType, useFragment } from "@/__generated__";
import { FormSection } from "./FormSection";
import { useTranslations } from "next-intl";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import { useServerSideSearch } from "@/hooks/useServerSideSearch";
import { mergeSearchOptions } from "@/components/forms/helpers";
import { EMPLOYEE_ENTITIES_INFO_FRAGMENT } from "../../graphql/EmployeeQueries";


/**
 * Props for the TimelineHierarchySection component.
 */
interface TimelineHierarchySectionProps {
  /** Reference to the employee basic info fragment. */
  employeeRef: FragmentType<typeof EMPLOYEE_ENTITIES_INFO_FRAGMENT>;
}

/**
 * Form section for employee timeline (hire date), hierarchy (manager), and status.
 * Component handles its own data mapping from fragments to option arrays.
 *
 * @param {TimelineHierarchySectionProps} props - The component props.
 * @returns {JSX.Element} The rendered TimelineHierarchySection component.
 */
export const TimelineHierarchySection = memo(({
  employeeRef,
}: TimelineHierarchySectionProps) => {
  const employee = useFragment(EMPLOYEE_ENTITIES_INFO_FRAGMENT, employeeRef);

  const t = useTranslations("employees");
  const tc = useTranslations("common");

  const employeeSearch = useEmployeeSearch();

  const {
    options: searchedManagerOptions,
    loading: loadingManagers,
    onSearch: onManagerSearch,
    triggerInitialSearch: triggerManagerInitialSearch,
  } = useServerSideSearch(employeeSearch);

  useEffect(() => {
    triggerManagerInitialSearch().catch(() => {});
  }, [triggerManagerInitialSearch]);

  const managerOptions = useMemo(() => {
    const merged = mergeSearchOptions(
      searchedManagerOptions,
      employee?.manager
        ? { id: employee.manager.id, name: employee.manager.fullName }
        : null
    );

    return [{ label: tc("none"), value: "none" }, ...merged];
  }, [employee, searchedManagerOptions, tc]);

  return (
    <FormSection title="Timeline & Hierarchy">
      <div className="grid grid-cols-2 gap-4">
        <FormDateInput name="hireDate" label={tc("hireDate")} required />

        <FormComboboxInput
          name="managerId"
          label={t("manager")}
          options={managerOptions}
          onSearch={onManagerSearch}
          loading={loadingManagers}
        />

        <div className="col-span-1 mt-2">
          <div className="rounded-lg">
            <FormSwitch
              name="isActive"
              labelPosition="top"
              label={tc("active")}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
});

TimelineHierarchySection.displayName = "TimelineHierarchySection";
