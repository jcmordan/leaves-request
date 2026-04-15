import { FormComboboxInput, FormSwitch } from "@/components/forms";
import { FormSection } from "./FormSection";
import { useTranslations } from "next-intl";
import { useEmployeeSearch } from "@/app/[locale]/(root)/employees/sheets/hooks/useEmployeeSearch";
import { useServerSideSearch } from "@/hooks/useServerSideSearch";
import { useEffect } from "react";

const EmployeeSelector = () => {
  const t = useTranslations("requests");


  const employeeSearch = useEmployeeSearch();

  const {
    options: employeeOptions,
    loading: loadingEmployees,
    onSearch: onEmployeeSearch,
    triggerInitialSearch: triggerEmployeeInitialSearch,
  } = useServerSideSearch(employeeSearch);

  useEffect(() => {
    triggerEmployeeInitialSearch().catch(() => {});
  }, [triggerEmployeeInitialSearch]);

  return (
    <FormSection title={t("employee")}>
      <div className="grid grid-cols-2 gap-4">

        <FormComboboxInput
          name="employeeId"
          label={t("employee")}
          options={employeeOptions}
          loading={loadingEmployees}
          onSearch={onEmployeeSearch}
          required
        />
      </div>
    </FormSection>
  );
};

export default EmployeeSelector;
