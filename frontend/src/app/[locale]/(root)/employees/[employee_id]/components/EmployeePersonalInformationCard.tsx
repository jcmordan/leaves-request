"use client";

import { ShieldCheck, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_PERSONAL_INFO_FRAGMENT } from "@/app/[locale]/(root)/employees/[employee_id]/graphql/EmployeeDetailsQueries";
import { formatNationalId, formatDate } from "@/utils/formatters";
import { calculateAge, fromNow } from "@/utils/dateUtils";

interface EmployeePersonalInformationCardProps {
  employeeRef: FragmentType<typeof EMPLOYEE_PERSONAL_INFO_FRAGMENT>;
}

export function EmployeePersonalInformationCard({
  employeeRef,
}: Readonly<EmployeePersonalInformationCardProps>) {
  const employees = useTranslations("employees");
  const common = useTranslations("common");
  const employee = useFragment(EMPLOYEE_PERSONAL_INFO_FRAGMENT, employeeRef);

  return (
    <Card className="border-none bg-surface-container-lowest shadow-ambient overflow-hidden">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            {employees("personalInformation")}
          </h3>
          <User className="h-5 w-5 text-tertiary/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {employees("emailAddress")}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary">
              {employee.email ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {common("nationalId")}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary">
              {formatNationalId(employee.nationalId)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {common("hireDate")}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary">
              {formatDate(employee.hireDate, "MMMM d, yyyy")}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground/70">
              {employees("tenure", { count: calculateAge(employee.hireDate) })}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {employees("workLocation")}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary">
              Haina Refinery Complex
            </p>
            <p className="text-[11px] font-medium text-muted-foreground/70">
              Office C-42
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
