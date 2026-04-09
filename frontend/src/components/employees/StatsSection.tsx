"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslations, useFormatter } from "next-intl";
import { Users, UserCheck, Plane, TrendingUp, UserX } from "lucide-react";
import { FragmentType, useFragment } from "@/__generated__";
import { EMPLOYEE_STATS_FRAGMENT } from "@/app/[locale]/(root)/employees/graphql/EmployeeQueries";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  avatars?: string[];
}

function StatCard({ title, value, icon: Icon, trend, avatars }: StatCardProps) {
  const t = useTranslations("Employees");
  const format = useFormatter();

  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-surface-variant/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="text-3xl font-black text-primary tracking-tight">
            {format.number(value)}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mb-1 px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-full">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>

        {avatars && (
          <div className="flex -space-x-2 mt-4 justify-end">
            {avatars.map((avatar, i) => (
              <div
                key={i}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200"
                style={{ backgroundColor: `hsl(${i * 60}, 70%, 80%)` }}
              >
                {/* Avatar placeholder logic */}
              </div>
            ))}
          </div>
        )}

        {!avatars && trend && (
          <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none">
            {t("statsTrend", { value: trend })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}


type Props = {
  statsQueryRef: FragmentType<typeof EMPLOYEE_STATS_FRAGMENT>;
};

export function StatsSection({ statsQueryRef }: Props) {
  const t = useTranslations("Employees");

  const { employeeStats } = useFragment(EMPLOYEE_STATS_FRAGMENT, statsQueryRef);

  return (
    <div className="grid gap-6 md:grid-cols-4 mb-10">
      <StatCard
        title={t("statsTotal")}
        value={employeeStats.total}
        icon={Users}
      />
      <StatCard
        title={t("statsActive")}
        value={employeeStats.active}
        icon={UserCheck}
        avatars={["A", "B", "C", "D"]}
      />
      <StatCard
        title={t("statsOnLeave")}
        value={employeeStats.onLeave}
        icon={Plane}
      />
      <StatCard
        title={t("statsInactive")}
        value={employeeStats.inactive}
        icon={UserX}
      />
    </div>
  );
}
