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
import { EmployeeFormValues } from "./EmployeeEditForm";

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
  metadata,
  loadingMetadata,
}: {
  metadata: any;
  loadingMetadata: boolean;
}) => {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const { watch } = useFormContext<EmployeeFormValues>();

  const selectedDepartmentId = watch("departmentId");

  // Options mapping
  const jobTitleOptions = useMemo(
    () =>
      metadata?.jobTitles?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [],
    [metadata],
  );

  const companyOptions = useMemo(
    () =>
      metadata?.companies?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [],
    [metadata],
  );

  const departmentOptions = useMemo(
    () =>
      metadata?.departments?.edges?.map((e: any) => ({
        label: e.node.name,
        value: e.node.id,
      })) ?? [],
    [metadata],
  );

  const departmentSectionOptions = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return (
      metadata?.departmentSections?.edges
        ?.map((e: any) => e.node)
        .filter(
          (s: any) =>
            s.departmentId === selectedDepartmentId || !s.departmentId,
        )
        .map((s: any) => ({
          label: s.name,
          value: s.id,
        })) ?? []
    );
  }, [metadata, selectedDepartmentId]);

  const managerOptions = useMemo(
    () => [
      { label: tc("none"), value: "none" },
      ...(metadata?.employees?.edges?.map((e: any) => ({
        label: e.node.fullName,
        value: e.node.id,
      })) ?? []),
    ],
    [metadata, tc],
  );

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
            loading={loadingMetadata}
          />

          <FormComboboxInput
            name="companyId"
            label={tc("company")}
            options={companyOptions}
            required
            loading={loadingMetadata}
          />

          <FormComboboxInput
            name="departmentId"
            label={tc("department")}
            options={departmentOptions}
            required
            loading={loadingMetadata}
          />

          <FormComboboxInput
            name="departmentSectionId"
            label="Dept Section"
            options={departmentSectionOptions}
            loading={loadingMetadata}
            disabled={!selectedDepartmentId}
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
            loading={loadingMetadata}
          />

          <div className="col-span-2 mt-2">
            <div className="p-4 bg-surface-container-low/50 rounded-lg">
              <FormSwitch name="isActive" label={tc("status")} />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

