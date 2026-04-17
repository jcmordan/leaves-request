"use client";

import { BarChart, Bar, Cell, XAxis, LabelList } from "recharts";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";
import { cn } from "@/lib/utils";

/**
 * Props for LeaveTrendsCard Component.
 */
interface LeaveTrendsCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  compact?: boolean;
}

/**
 * LeaveTrendsCard — Visual representation of leave demand over time.
 * Displays a minimalist bar chart to highlight peak demand days.
 */
export function LeaveTrendsCard({ summaryRef, compact = false }: LeaveTrendsCardProps) {
  const t = useTranslations("requests");
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);
  const trendData = summary.trendData || [];

  const currentYear = new Date().getFullYear();
  const peakDay = trendData.length > 0 
    ? trendData.reduce((prev, current) => (prev.count > current.count) ? prev : current, trendData[0])
    : null;

  const chartConfig = {
    count: {
      label: t("totalRequests"),
      color: "var(--surface-container-highest)",
    },
    peak: {
      label: t("mostRequestedPrompt", { day: "" }).split(" ")[0], // Heuristic fallback
      color: "var(--secondary-container)",
    },
  } satisfies ChartConfig;

  const chartData = trendData.map((day) => ({
    day: day.label,
    count: day.count,
    fill:
      day.label === peakDay?.label && day.count > 0
        ? "var(--color-peak)"
        : "var(--color-count)",
  }));

  return (
    <div
      className={cn(
        "w-full h-full rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-low animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 flex flex-col",
        compact ? "p-3" : "p-6"
      )}
    >
      <div className={cn("flex justify-between items-start", compact ? "mb-1" : "mb-4")}>
        <div className="flex flex-col">
          <p
            className={cn(
              "uppercase tracking-[0.15em] text-on-surface-variant/60 font-black font-body",
              compact ? "text-[8px]" : "text-xs"
            )}
          >
            {t("usageTendencies")}
          </p>
          {!compact && (
            <p className="text-[10px] text-on-surface-variant/40 font-medium">
              {t("weeklyDistribution", { year: currentYear })}
            </p>
          )}
        </div>
        {!compact && <DashboardInfoTooltip content={t("trendsTooltip")} />}
      </div>

      <div className={cn("flex-1 mt-2", compact ? "min-h-[40px]" : "min-h-[80px]")}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart data={chartData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--on-surface-variant)",
                fontSize: compact ? 6 : 8,
                opacity: 0.5,
              }}
              tickFormatter={(value) => value.charAt(0)}
              interval={0}
              height={compact ? 8 : 12}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} className="transition-all duration-500">
              {!compact && (
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={8}
                  className="fill-on-surface-variant/40 text-[8px] font-bold"
                />
              )}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {!compact &&
        (peakDay && peakDay.count > 0 ? (
          <p className="mt-6 text-[10px] text-on-surface-variant font-medium font-body leading-relaxed">
            {t("mostRequestedPrompt", { day: peakDay.label })}
          </p>
        ) : (
          <p className="mt-6 text-[10px] text-on-surface-variant font-medium font-body">
            {t("noPatternsIdentified", { year: currentYear })}
          </p>
        ))}
    </div>
  );
}
