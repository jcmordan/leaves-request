"use client";

import * as z from "zod";

import { Separator } from "@/components/ui/separator";
import { FragmentType, useFragment } from "@/__generated__";
import {
  EMPLOYEE_EDIT_METADATA_FRAGMENT,
  EMPLOYEE_BASIC_INFO_FRAGMENT,
} from "./EmployeeEditSheetQueries";
import {
  IdentitySection,
  RolePlacementSection,
  TimelineHierarchySection,
} from "./sections";

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


export const EmployeeEditFormContent = ({
  metadataRef,
  employeeRef,
}: {
  metadataRef?: FragmentType<typeof EMPLOYEE_EDIT_METADATA_FRAGMENT> | null;
  employeeRef?: FragmentType<typeof EMPLOYEE_BASIC_INFO_FRAGMENT> | null;
}) => {
  const metadata = useFragment(EMPLOYEE_EDIT_METADATA_FRAGMENT, metadataRef);

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
      <IdentitySection />

      <Separator className="opacity-50" />

      <RolePlacementSection employeeRef={employeeRef!} />

      <Separator className="opacity-50" />

      <TimelineHierarchySection employeeRef={employeeRef!} />
    </div>
  );
};

