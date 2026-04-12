"use client";

import * as z from "zod";

import { Separator } from "@/components/ui/separator";
import { FragmentType } from "@/__generated__";
import { EMPLOYEE_ENTITIES_INFO_FRAGMENT } from "../graphql/EmployeeQueries";
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
  employeeRef,
}: {
  employeeRef?: FragmentType<typeof EMPLOYEE_ENTITIES_INFO_FRAGMENT> | null;
}) => {
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
