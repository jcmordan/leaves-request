"use client";

import { useTranslations, useFormatter } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";
import { cn } from "@/lib/utils";

/**
 * Props for ActivityTrackingCard Component.
 */
interface ActivityTrackingCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  compact?: boolean;
}

/**
 * ActivityTrackingCard — Tracks approval activity over time.
 * Displays total approved requests this month and comparison vs previous year.
 */
export function ActivityTrackingCard({ summaryRef, compact = false }: ActivityTrackingCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);
  
  const percentage = summary.approvedVsLastYearPercentage;
  const isPositive = percentage >= 0;

  return (
    <div
      className={cn(
        "w-full h-full rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-low animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 flex flex-col justify-between",
        compact ? "p-3" : "p-6"
      )}
    >
      <div>
        <div className={cn("flex justify-between items-start", compact ? "mb-1" : "mb-4")}>
          <p className={cn("uppercase tracking-[0.15em] text-on-surface-variant/60 font-black font-body", compact ? "text-[8px]" : "text-xs")}>
            {t("activityTracking")}
          </p>
          {!compact && <DashboardInfoTooltip content={t("activityTooltip")} />}
        </div>

        <div className={cn("flex items-baseline gap-2", compact ? "mb-1" : "mb-6")}>
          <h3 className={cn("font-black font-headline text-primary", compact ? "text-xl" : "text-4xl")}>
            {summary.approvedThisMonthCount}
          </h3>
          <span className={cn("font-semibold text-on-surface-variant/40 lowercase", compact ? "text-[10px]" : "text-sm")}>
            {t("approved")}
          </span>
        </div>
      </div>

      <div className={cn("space-y-3", compact && "space-y-1")}>
        <div className="flex items-center justify-between gap-4">
          {!compact && (
            <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isPositive ? "bg-secondary" : "bg-primary"}`}
                style={{ width: "75%" }} // Visual placeholder for current month progress
              />
            </div>
          )}
          <span className={cn("font-black whitespace-nowrap", isPositive ? "text-secondary" : "text-primary", compact ? "text-[9px]" : "text-[10px]")}>
            {t("vsLastYear", {
              value: (isPositive ? "+" : "") + format.number(percentage, { maximumFractionDigits: 1 }),
            })}
          </span>
        </div>
        {!compact && (
          <p className="text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
            {t("cumulativeAnnualVolume")}
          </p>
        )}
      </div>
    </div>
  );
}
