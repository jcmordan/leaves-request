"use client";

import { Zap } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import Link from "next/link";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";

interface DashboardCapacityCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * DashboardCapacityCard — High-level team availability overview.
 * Featuring circular progress and workload breakdown.
 */
export function DashboardCapacityCard({ summaryRef }: DashboardCapacityCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef) as any;

  const {
    availablePercentage,
    totalTeamMembers,
    membersOnLeave,
    pendingMembersOnLeave,
    upcomingMinAvailablePercentage,
    upcomingMinAvailableDate,
  } = summary;

  // Chart Data Preparation
  const chartData = [
    { name: "approved", value: membersOnLeave, fill: "var(--color-approved)" },
    {
      name: "pending",
      value: pendingMembersOnLeave,
      fill: "var(--color-pending)",
    },
    {
      name: "available",
      value: Math.max(
        0,
        totalTeamMembers - membersOnLeave - pendingMembersOnLeave,
      ),
      fill: "var(--color-available)",
    },
  ];

  const chartConfig = {
    approved: { label: t("approved"), color: "#002754" }, // Primary Navy
    pending: { label: t("pending"), color: "#f59e0b" }, // Amber 500
    available: { label: t("available"), color: "#10b981" }, // Emerald 500
  } satisfies ChartConfig;

  // Risk Threshold check (60%)
  const isHighRisk = upcomingMinAvailablePercentage < 60;
  
  const horizonDate = upcomingMinAvailableDate
    ? format.dateTime(
        new Date(upcomingMinAvailableDate.split("T")[0] + "T12:00:00"),
        {
          month: "short",
          day: "numeric",
        },
      )
    : null;

  return (
    <div className="w-full h-full p-5 rounded-xl bg-surface-container-lowest shadow-sm relative overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-lg font-bold text-primary tracking-tight">
              {t("teamCapacity")}
            </h2>
            <DashboardInfoTooltip content={t("capacityTooltip")} />
          </div>
          <p className="text-[10px] text-on-surface-variant/60 font-body items-center flex gap-1">
            {t("proactiveHorizon")}
            <div
              className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
            />
          </p>
        </div>
        <Zap
          className={`h-5 w-5 ${isHighRisk ? "text-red-500 animate-bounce" : "text-secondary"} fill-current/20`}
        />
      </div>

      <div className="relative flex items-center justify-center mb-4 h-32">
        <ChartContainer
          config={chartConfig}
          className="w-32 h-32 flex items-center justify-center"
        >
          <PieChart width={128} height={128}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={64}
              stroke="none"
              startAngle={450}
              endAngle={90}
              paddingAngle={0}
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`text-2xl font-black font-headline ${isHighRisk ? "text-red-600" : "text-primary"}`}
          >
            {availablePercentage}%
          </span>
          <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
            {t("today")}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Legendary / Breakdown */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[11px] font-medium text-on-surface-variant">
              {t("approved")}
            </span>
          </div>
          <span className="text-[11px] font-bold">{membersOnLeave}</span>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-medium text-on-surface-variant">
              {t("pendingImpact")}
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-600">
            +{pendingMembersOnLeave}
          </span>
        </div>

        {/* Horizon Forecast Box */}
        <div
          className={`mt-2 p-2.5 rounded-xl border ${isHighRisk ? "bg-red-50 border-red-100" : "bg-surface-container-low border-surface-container"} transition-colors`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">
              {t("horizonOutlook")}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p
                className={`text-[11px] font-bold ${isHighRisk ? "text-red-700" : "text-primary"}`}
              >
                {t("minCapacityForecast", {
                  percentage: upcomingMinAvailablePercentage,
                })}
              </p>
              <p className="text-[10px] text-on-surface-variant/70">
                {t("expectedOn")}{" "}
                <span className="font-bold">{horizonDate || "N/A"}</span>
              </p>
            </div>
            <div className="text-right">
              <DashboardInfoTooltip
                variant="subtle"
                content={t("horizonTooltip")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-surface-container">
        <Link
          href="/leave-requests/team-capacity"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase hover:bg-primary/10 transition-all"
        >
          {t("detailedSchedule")}
        </Link>
      </div>
    </div>
  );
}
