"use client";

import { Timer, ClipboardCheck } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";
import { cn } from "@/lib/utils";

/**
 * Props for PendingCountCard Component.
 */
interface PendingCountCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  compact?: boolean;
}

/**
 * PendingCountCard — High-contrast alert card for managers.
 * Highlights the number of pending approvals and average response time.
 */
export function PendingCountCard({ summaryRef, compact = false }: PendingCountCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);

  return (
    <div
      className={cn(
        "w-full h-full rounded-xl bg-linear-to-br from-primary to-primary-container text-white shadow-lg relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700",
        compact ? "p-4" : "p-6"
      )}
    >
      {/* Background Decorative Icon - Hidden in compact mode */}
      {!compact && (
        <ClipboardCheck className="absolute -right-6 -bottom-6 h-40 w-40 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
      )}

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className={cn("flex justify-between items-start", compact ? "mb-1" : "mb-2")}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary-container/80 font-black font-body">
              {t("actionRequired")}
            </p>
            {!compact && (
              <DashboardInfoTooltip
                content={t("pendingTooltip")}
                iconClassName="text-white/40 group-hover:text-white"
              />
            )}
          </div>
          <h3
            className={cn(
              "font-black font-headline tracking-tight",
              compact ? "text-xl" : "text-4xl mb-4"
            )}
          >
            {t("pendingCountTitle", { count: summary.pendingCount })}
          </h3>
        </div>

        <div className={cn("flex items-center gap-2 font-bold text-secondary-container mt-auto", compact ? "text-[10px]" : "text-xs")}>
          <Timer className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          <span className="tracking-wide">
            {t("avgResponseTime", {
              value: format.number(summary.avgResponseTimeHours || 0, {
                maximumFractionDigits: 1,
              }),
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
