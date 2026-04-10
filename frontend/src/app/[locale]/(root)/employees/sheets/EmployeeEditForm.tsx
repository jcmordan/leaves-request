"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  FormTextInput,
  FormComboboxInput,
  FormDateInput,
  FormSwitch,
} from "@/components/forms";
import { FragmentType, useFragment } from "@/__generated__";
import {
  EMPLOYEE_EDIT_METADATA_FRAGMENT,
  EMPLOYEE_BASIC_INFO_FRAGMENT,
} from "./EmployeeEditSheetQueries";

export const employeeFormSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  employeeCode: z.string().min(1, "Employee Code is required"),
  an8: z.string().min(1, "AN8 ID is required"),
  nationalId: z.string().min(1, "National ID is required"),
  jobTitleId: z.string().min(1, "Job Title is required"),
  departmentId: z.string().min(1, "Department is required"),
  departmentSectionId: z.string().optional().nullable(),
  companyId: z.string().min(1, "Company is required"),
  hireDate: z.coerce.date({
    error: "Hire Date is required",
  }),
  isActive: z.boolean().default(true),
  managerId: z.string().optional().nullable(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

const FormSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center gap-2 mb-2 pb-4">
      <span className="w-1 h-4 bg-secondary rounded-full" />
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">
        {title}
      </h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const EmployeeEditFormContent = ({
  metadataRef,
  employeeRef,
}: {
  metadataRef?: FragmentType<typeof EMPLOYEE_EDIT_METADATA_FRAGMENT> | null;
  employeeRef?: FragmentType<typeof EMPLOYEE_BASIC_INFO_FRAGMENT> | null;
}) => {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const { watch } = useFormContext<EmployeeFormValues>();

  const selectedDepartmentId = watch("departmentId");
  const metadata = useFragment(EMPLOYEE_EDIT_METADATA_FRAGMENT, metadataRef);
  const employee = useFragment(EMPLOYEE_BASIC_INFO_FRAGMENT, employeeRef);

  // Options mapping
  const jobTitleOptions = useMemo(() => {
    const list =
      metadata?.jobTitles?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [];

    // Ensure currently assigned job title is in the list to avoid race conditions/pagination issues
    if (
      employee?.jobTitle &&
      !list.some((o) => o.value === employee.jobTitle?.id)
    ) {
      list.push({
        label: employee.jobTitle.name,
        value: employee.jobTitle.id,
      });
    }

    return list;
  }, [metadata, employee]);

  const companyOptions = useMemo(() => {
    const list =
      metadata?.companies?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [];

    if (
      employee?.company &&
      !list.some((o) => o.value === employee.company?.id)
    ) {
      list.push({
        label: employee.company.name,
        value: employee.company.id,
      });
    }

    return list;
  }, [metadata, employee]);

  const departmentOptions = useMemo(() => {
    const list =
      metadata?.departments?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [];

    if (
      employee?.department &&
      !list.some((o) => o.value === employee.department?.id)
    ) {
      list.push({
        label: employee.department.name,
        value: employee.department.id,
      });
    }

    return list;
  }, [metadata, employee]);

  const departmentSectionOptions = useMemo(() => {
    const list =
      metadata?.departmentSections?.edges
        ?.filter((e: any) => e.node.departmentId === selectedDepartmentId)
        .map((e: any) => ({
          label: e.node.name,
          value: e.node.id,
        })) ?? [];

    // Filtered by department, but we should still ensure the current one is visible
    // if it matches the currently selected department.
    if (
      employee?.departmentSection &&
      employee.departmentSection.id &&
      !list.some((o) => o.value === employee.departmentSection?.id) &&
      (!selectedDepartmentId ||
        employee.department?.id === selectedDepartmentId)
    ) {
      list.push({
        label: employee.departmentSection.name,
        value: employee.departmentSection.id,
      });
    }

    return list;
  }, [metadata, employee, selectedDepartmentId]);

  const managerOptions = useMemo(() => {
    const list =
      metadata?.employees?.edges?.map((e: any) => ({
        label: e.node.fullName,
        value: e.node.id,
      })) ?? [];

    if (
      employee?.manager &&
      !list.some((o) => o.value === employee.manager?.id)
    ) {
      list.push({
        label: employee.manager.fullName,
        value: employee.manager.id,
      });
    }

    return [{ label: tc("none"), value: "none" }, ...list];
  }, [metadata, employee, tc]);

  // If metadata hasn't been loaded yet, we don't render the form fields
  // to prevent race conditions with default values being set before options are available.
  if (!metadata) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Section 1: Identity & Contact */}
      <FormSection title="Identity & Contact">
        <div className="grid grid-cols-2 gap-4 w-full">
          <FormTextInput
            name="fullName"
            label={tc("fullName")}
            placeholder="John Doe"
            required
          />
          <FormTextInput
            name="email"
            label={tc("email")}
            placeholder="john.doe@company.com"
          />
          <FormTextInput
            name="employeeCode"
            label={tc("employeeCode")}
            placeholder="EMP001"
            required
          />
          <FormTextInput
            name="an8"
            label={tc("an8")}
            placeholder="1234567"
            required
          />
          <FormTextInput
            name="nationalId"
            label={tc("nationalId")}
            placeholder="ID-12345"
            required
          />
        </div>
      </FormSection>

      <Separator className="opacity-50" />

      {/* Section 2: Role & Placement */}
      <FormSection title="Role & Placement">
        <div className="grid grid-cols-2 gap-4">
          <FormComboboxInput
            name="jobTitleId"
            label={tc("role")}
            options={jobTitleOptions}
            required
          />

          <FormComboboxInput
            name="companyId"
            label={tc("company")}
            options={companyOptions}
            required
          />

          <FormComboboxInput
            name="departmentId"
            label={tc("department")}
            options={departmentOptions}
            required
          />

          <FormComboboxInput
            name="departmentSectionId"
            label="Dept Section"
            options={departmentSectionOptions}
            disabled={
              !selectedDepartmentId || departmentSectionOptions.length === 0
            }
          />
        </div>
      </FormSection>

      <Separator className="opacity-50" />

      {/* Section 3: Timeline & Hierarchy */}
      <FormSection title="Timeline & Hierarchy">
        <div className="grid grid-cols-2 gap-4">
          <FormDateInput name="hireDate" label={tc("hireDate")} required />

          <FormComboboxInput
            name="managerId"
            label={t("manager")}
            options={managerOptions}
          />

          <div className="col-span-1 mt-2">
            <div className="rounded-lg">
              <FormSwitch
                name="isActive"
                labelPosition="top"
                label={tc("status")}
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

