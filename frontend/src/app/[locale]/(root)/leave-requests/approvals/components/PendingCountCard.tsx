"use client";

import { Timer, ClipboardCheck } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

interface PendingCountCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * PendingCountCard — High-contrast alert card for managers.
 * Highlights the number of pending approvals and average response time.
 */
export function PendingCountCard({ summaryRef }: PendingCountCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);

  return (
    <div className="w-full h-full p-6 rounded-xl bg-linear-to-br from-primary to-primary-container text-white shadow-lg relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Background Decorative Icon */}
      <ClipboardCheck 
        className="absolute -right-6 -bottom-6 h-40 w-40 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" 
      />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary-container/80 font-black font-body">{t("actionRequired")}</p>
            <DashboardInfoTooltip 
              content={t("pendingTooltip")} 
              iconClassName="text-white/40 group-hover:text-white"
            />
          </div>
          <h3 className="text-4xl font-black font-headline mb-4 tracking-tight">
            {t("pendingCountTitle", { count: summary.pendingCount })}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-secondary-container mt-auto">
          <Timer className="h-4 w-4" />
          <span className="tracking-wide">
            {t("avgResponseTime", { 
              value: format.number(summary.avgResponseTimeHours || 0, { maximumFractionDigits: 1 }) 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
