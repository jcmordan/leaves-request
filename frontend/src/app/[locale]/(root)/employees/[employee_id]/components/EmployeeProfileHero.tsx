"use client";

import { FragmentType, useFragment } from "@/__generated__";
import { useTranslations } from "next-intl";
import { EMPLOYEE_DETAILS_HERO_FRAGMENT } from "@/app/[locale]/(root)/employees/[employee_id]/graphql/EmployeeDetailsQueries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/utils/formatters";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";

interface EmployeeProfileHeroProps {
  employeeRef: FragmentType<typeof EMPLOYEE_DETAILS_HERO_FRAGMENT>;
}


export function EmployeeProfileHero({
  employeeRef,
}: Readonly<EmployeeProfileHeroProps>) {
  const common = useTranslations("common");
  const employees = useTranslations("employees");
  const employee = useFragment(EMPLOYEE_DETAILS_HERO_FRAGMENT, employeeRef);
  const { openSheet } = useSheets();

  const handleEdit = () => {
    openSheet("EmployeeEditSheet", { employeeId: employee.id }, { width: "lg" });
  };

  return (
    <Card className="flex flex-col border-none bg-surface-container-lowest p-8 shadow-ambient lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary text-4xl font-black text-white shadow-xl">
            {getInitials(employee.fullName)}
          </div>
          <Badge
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-4 border-surface-container-lowest bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white lg:bottom-0 lg:left-full lg:-translate-x-3/4"
            variant="secondary"
          >
            {employee.isActive ? common("active") : common("inactive")}
          </Badge>
        </div>

        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className="font-heading text-4xl font-black tracking-tight text-primary">
            {employee.fullName}
          </h2>
          <p className="text-lg font-semibold text-tertiary">
            {employee.jobTitle?.name ?? "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
        <Button
          className="btn-primary gap-2 h-12 w-48"
          size="lg"
          onClick={handleEdit}
        >
          <Edit3 className="h-4 w-4" />
          {employees("editProfile")}
        </Button>
      </div>
    </Card>
  );
}
