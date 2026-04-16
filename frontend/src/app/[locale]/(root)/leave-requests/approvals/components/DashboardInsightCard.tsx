"use client";

import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

interface DashboardInsightCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * DashboardInsightCard — Manager Tip / Heuristic insight alert.
 * Displays smart suggestions based on team leave patterns.
 */
export function DashboardInsightCard({ summaryRef }: DashboardInsightCardProps) {
  const t = useTranslations("requests");
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);

  if (!summary.insightMessage) {
    return null;
  }

  return (
    <div className="w-full h-full p-6 rounded-xl bg-secondary-container text-on-secondary-container shadow-sm border border-secondary/10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5" />
          <h4 className="font-bold text-sm tracking-tight">{t("managerTip")}</h4>
        </div>
        <DashboardInfoTooltip 
          variant="subtle"
          content={t("insightTooltip")} 
        />
      </div>
      <p className="text-xs leading-relaxed font-medium">
        {summary.insightMessage}
      </p>
    </div>
  );
}
