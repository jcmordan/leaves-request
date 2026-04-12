"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { Card } from "@/components/ui/card";
import { EMPLOYEE_CORPORATE_DATA_FRAGMENT } from "../../graphql/EmployeeQueries";

interface EmployeeCorporateDataCardProps {
  employeeRef: FragmentType<typeof EMPLOYEE_CORPORATE_DATA_FRAGMENT>;
}

export function EmployeeCorporateDataCard({
  employeeRef,
}: Readonly<EmployeeCorporateDataCardProps>) {
  const employees = useTranslations("employees");
  const common = useTranslations("common");
  const employee = useFragment(EMPLOYEE_CORPORATE_DATA_FRAGMENT, employeeRef);

  return (
    <Card className="border-none bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          {employees("corporateData")}
        </h3>
        <Building2 className="h-5 w-5 text-tertiary/50" />
      </div>

      <div className="grid grid-cols-2 gap-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {common("employeeCode")}
          </p>
          <p className="mt-0.5 text-base font-bold text-primary">
            {employee.employeeCode}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {common("an8")}
          </p>
          <p className="mt-0.5 text-base font-bold text-primary">
            {employee.an8}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {common("department")}
          </p>
          <p className="mt-0.5 text-base font-bold text-primary">
            {employee.department?.name ?? "-"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {common("company")}
          </p>
          <p className="mt-0.5 text-base font-bold text-primary">
            {employee.company?.name ?? "-"}
          </p>
        </div>
      </div>
    </Card>
  );
}
