"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import FormSheet from "@/components/layout/sheets/FormSheet";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import {
  EMPLOYEE_FOR_EDIT_QUERY,
  UPDATE_EMPLOYEE_MUTATION,
} from "./EmployeeEditSheetQueries";
import {
  EmployeeEditFormContent,
  EmployeeFormValues,
} from "./EmployeeEditForm";
import { useParams } from "next/navigation";

export const EmployeeEditSheet = () => {
  const { closeSheet } = useSheets();
  const t = useTranslations("employees");
  const params = useParams();
  const employeeId = params.employee_id as string;

  const { data: employeeData, loading: loadingEmployee } = useQuery(
    EMPLOYEE_FOR_EDIT_QUERY,
    {
      variables: { id: employeeId },
      skip: !employeeId,
    },
  );

  const [updateEmployee, { loading: updating }] = useMutation(
    UPDATE_EMPLOYEE_MUTATION,
    {
      onCompleted: () => {
        closeSheet();
      },
      refetchQueries: ["GetEmployees", "GetEmployeeById"],
    },
  );

  const defaultValues = useMemo<Partial<EmployeeFormValues>>(() => {
    if (!employeeData?.employee) return {};
    const e = employeeData.employee;
    return {
      fullName: e.fullName,
      email: e.email || "",
      employeeCode: e.employeeCode,
      an8: e.an8,
      nationalId: e.nationalId,
      jobTitleId: e.jobTitle?.id,
      departmentId: e.department?.id,
      departmentSectionId: e.departmentSection?.id,
      companyId: e.company?.id,
      hireDate: e.hireDate ? new Date(e.hireDate) : new Date(),
      isActive: e.isActive,
      managerId: e.manager?.id,
    };
  }, [employeeData]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    await updateEmployee({
      variables: {
        input: {
          id: employeeId,
          ...values,
          managerId: values.managerId === "none" ? null : values.managerId,
        },
      },
    });
  };

  return (
    <FormSheet
      title={t("editProfile")}
      description="Update employee's sovereign identity and organizational role."
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      loading={loadingEmployee}
      submitting={updating}
      className="md:w-[540px] lg:w-[600px] bg-white" // Adjusted width and set white background per design
    >
      <EmployeeEditFormContent
        metadataRef={employeeData}
        employeeRef={employeeData?.employee}
      />
    </FormSheet>
  );
};

export default EmployeeEditSheet;
