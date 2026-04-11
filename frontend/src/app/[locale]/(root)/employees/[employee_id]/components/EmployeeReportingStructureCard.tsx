"use client";

import { ChevronRight, Share2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/utils/formatters";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPLOYEE_REPORTING_STRUCTURE_FRAGMENT } from "../../graphql/EmployeeQueries";

interface EmployeeReportingStructureCardProps {
  employeeRef: FragmentType<typeof EMPLOYEE_REPORTING_STRUCTURE_FRAGMENT>;
}

export function EmployeeReportingStructureCard({
  employeeRef,
}: Readonly<EmployeeReportingStructureCardProps>) {
  const employees = useTranslations("employees");
  const employee = useFragment(
    EMPLOYEE_REPORTING_STRUCTURE_FRAGMENT,
    employeeRef,
  );
  const pathname = usePathname();

  return (
    <Card className="border-none bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          {employees("reportingStructure")}
        </h3>
        <Share2 className="h-5 w-5 text-tertiary/50" />
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {employees("reportsTo")}
          </p>
          <button className="flex w-full items-center justify-between rounded-2xl bg-surface-container-low/50 p-4 transition-colors hover:bg-surface-container-low">
            <Link href={`${pathname}/../${employee.manager?.id}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-md">
                  {employee.manager?.fullName
                    ? getInitials(employee.manager.fullName)
                    : "-"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">
                    {employee.manager?.fullName ?? "-"}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {employee.manager?.jobTitle?.name ?? "-"}
                  </p>
                </div>
              </div>
            </Link>
            <ChevronRight className="h-5 w-5 text-tertiary/40" />
          </button>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {employees("directReports", {
              count: employee.subordinates.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-4 overflow-hidden">
              {employee.subordinates.slice(0, 3).map((sub, i) => (
                <div
                  key={sub.id}
                  className="inline-block h-10 w-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high ring-2 ring-transparent"
                >
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary/60">
                    {getInitials(sub.fullName)}
                  </div>
                </div>
              ))}
              {employee.subordinates.length > 3 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-high text-[10px] font-bold text-primary/60">
                  +{employee.subordinates.length - 3}
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            className="mt-4 w-full rounded-xl bg-surface-container-low/30 text-xs font-bold text-primary hover:bg-surface-container-low/50"
          >
            {employees("viewTeamDirectory")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
