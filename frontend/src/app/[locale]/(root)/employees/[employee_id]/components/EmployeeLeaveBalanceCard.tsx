"use client";

import { PieChart, Info, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FragmentType, useFragment } from "@/__generated__";
import { EMPLOYEE_LEAVE_BALANCE_FRAGMENT } from "../../graphql/EmployeeQueries";

interface EmployeeLeaveBalanceCardProps {
 employeeRef: FragmentType<typeof EMPLOYEE_LEAVE_BALANCE_FRAGMENT>;
}

export function EmployeeLeaveBalanceCard({
  employeeRef,
}: EmployeeLeaveBalanceCardProps) {
  const employees = useTranslations("employees");
  const employee = useFragment(EMPLOYEE_LEAVE_BALANCE_FRAGMENT, employeeRef);
  const balance = employee.leaveBalance;
  const percentage = Math.round(balance.availablePercentage);

  return (
    <Card className="border-none bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          {employees("leaveBalance")}
        </h3>
        <PieChart className="h-5 w-5 text-tertiary/50" />
      </div>

      <div className="flex flex-col items-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-surface-container-low"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="439.8"
              strokeDashoffset={439.8 - (439.8 * percentage) / 100}
              strokeLinecap="round"
              className="text-secondary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black tracking-tight text-primary">
              {balance.remaining}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {employees("daysLeft")}
            </span>
          </div>
        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface-container-low/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-secondary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {employees("entitlement")}
              </p>
            </div>
            <p className="text-lg font-black text-primary">
              {balance.totalEntitlement}
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-low/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-3.5 w-3.5 text-tertiary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {employees("taken")}
              </p>
            </div>
            <p className="text-lg font-black text-primary">{balance.taken}</p>
          </div>
        </div>

        <Button className="mt-6 w-full btn-secondary py-6 text-sm font-bold">
          {employees("viewDetailedHistory")}
        </Button>
      </div>
    </Card>
  );
}
