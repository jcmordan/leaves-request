"use client";

import { Zap } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import Link from "next/link";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Props for DashboardCapacityCard Component.
 */
interface DashboardCapacityCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  compact?: boolean;
}

/**
 * DashboardCapacityCard — High-level team availability overview.
 * Featuring circular progress and workload breakdown.
 */
export function DashboardCapacityCard({
  summaryRef,
  compact = false,
}: DashboardCapacityCardProps) {
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
    <div
      className={cn(
        "w-full h-full rounded-xl bg-surface-container-lowest shadow-sm relative overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700",
        compact ? "p-3" : "p-5"
      )}
    >
      <div className={cn("flex justify-between items-start", compact ? "mb-2" : "mb-4")}>
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "font-headline font-bold text-primary tracking-tight",
                compact ? "text-sm" : "text-lg"
              )}
            >
              {t("teamCapacity")}
            </h2>
            <DashboardInfoTooltip content={t("capacityTooltip")} />
          </div>
          {!compact && (
            <div className="text-[10px] text-on-surface-variant/60 font-body items-center flex gap-1">
              {t("proactiveHorizon")}
              <div
                className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
              />
            </div>
          )}
        </div>
        <Zap
          className={cn(
            isHighRisk ? "text-red-500 animate-bounce" : "text-secondary",
            "fill-current/20",
            compact ? "h-3 w-3" : "h-5 w-5"
          )}
        />
      </div>

      <div className={cn("relative flex items-center justify-center", compact ? "mb-2 h-20" : "mb-4 h-32")}>
        <ChartContainer
          config={chartConfig}
          className={cn("flex items-center justify-center", compact ? "w-20 h-20" : "w-32 h-32")}
        >
          <PieChart width={compact ? 80 : 128} height={compact ? 80 : 128}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={compact ? 32 : 50}
              outerRadius={compact ? 40 : 64}
              stroke="none"
              startAngle={450}
              endAngle={90}
              paddingAngle={0}
              cornerRadius={compact ? 2 : 4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={cn(
              "font-black font-headline",
              isHighRisk ? "text-red-600" : "text-primary",
              compact ? "text-sm" : "text-2xl"
            )}
          >
            {availablePercentage}%
          </span>
          <span className={cn("font-bold text-on-surface-variant/50 uppercase tracking-widest", compact ? "text-[7px]" : "text-[9px]")}>
            {t("today")}
          </span>
        </div>
      </div>

      <div className={cn("space-y-2.5", compact && "space-y-1")}>
        {/* Legendary / Breakdown */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className={cn("font-medium text-on-surface-variant", compact ? "text-[9px]" : "text-[11px]")}>
              {t("approved")}
            </span>
          </div>
          <span className={cn("font-bold", compact ? "text-[10px]" : "text-[11px]")}>{membersOnLeave}</span>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className={cn("font-medium text-on-surface-variant", compact ? "text-[9px]" : "text-[11px]")}>
              {t("pendingImpact")}
            </span>
          </div>
          <span className={cn("font-bold text-amber-600", compact ? "text-[10px]" : "text-[11px]")}>
            +{pendingMembersOnLeave}
          </span>
        </div>

        {/* Horizon Forecast Box - Hidden in compact mode */}
        {!compact && (
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
        )}
      </div>

      {!compact && (
        <div className="mt-auto pt-4 border-t border-surface-container">
          <Link
            href="/leave-requests/team-capacity"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase hover:bg-primary/10 transition-all"
          >
            {t("detailedSchedule")}
          </Link>
        </div>
      )}
    </div>
  );
}
