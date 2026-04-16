"use client";

import { useTranslations, useFormatter } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

interface ActivityTrackingCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * ActivityTrackingCard — Tracks approval activity over time.
 * Displays total approved requests this month and comparison vs previous year.
 */
export function ActivityTrackingCard({ summaryRef }: ActivityTrackingCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);
  
  const percentage = summary.approvedVsLastYearPercentage;
  const isPositive = percentage >= 0;

  return (
    <div className="w-full h-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-low animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs uppercase tracking-[0.15em] text-on-surface-variant/60 font-black font-body">{t("activityTracking")}</p>
          <DashboardInfoTooltip content={t("activityTooltip")} />
        </div>
        
        <div className="flex items-baseline gap-2 mb-6">
          <h3 className="text-4xl font-black font-headline text-primary">
            {summary.approvedThisMonthCount}
          </h3>
          <span className="text-sm font-semibold text-on-surface-variant/40 lowercase">{t("approved")}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isPositive ? "bg-secondary" : "bg-primary"}`}
              style={{ width: "75%" }} // Visual placeholder for current month progress
            />
          </div>
          <span className={`text-[10px] font-black whitespace-nowrap ${isPositive ? "text-secondary" : "text-primary"}`}>
            {t("vsLastYear", { 
              value: (isPositive ? "+" : "") + format.number(percentage, { maximumFractionDigits: 1 }) 
            })}
          </span>
        </div>
        <p className="text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
            {t("cumulativeAnnualVolume")}
        </p>
      </div>
    </div>
  );
}
