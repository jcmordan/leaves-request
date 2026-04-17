"use client";

import { FileX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";
import { cn } from "@/lib/utils";

/**
 * Props for RejectedCountCard Component.
 */
interface RejectedCountCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  compact?: boolean;
}

/**
 * RejectedCountCard Component
 * Displays the total number of rejected requests with a distinct error theme.
 */
export function RejectedCountCard({ summaryRef, compact = false }: RejectedCountCardProps) {
  const t = useTranslations("requests");
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);

  return (
    <div
      className={cn(
        "w-full h-full rounded-xl bg-linear-to-br from-error/10 to-error/5 text-error shadow-sm border border-error/10 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150",
        compact ? "p-3" : "p-6"
      )}
    >
      {/* Background Decorative Icon - Hidden in compact mode */}
      {!compact && (
        <FileX className="absolute -right-6 -bottom-6 h-40 w-40 text-error/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
      )}

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className={cn("flex justify-between items-start", compact ? "mb-2" : "mb-4")}>
            <div className="flex items-center gap-2">
              <div className={cn("rounded-lg bg-error/10 text-error border border-error/10 backdrop-blur-sm", compact ? "p-1" : "p-2")}>
                <FileX className={cn(compact ? "h-3 w-3" : "h-5 w-5")} />
              </div>
              <span className={cn("font-bold uppercase tracking-wider opacity-80 font-headline", compact ? "text-[10px]" : "text-xs")}>
                {t("rejectedTotal")}
              </span>
            </div>
            {!compact && (
              <DashboardInfoTooltip
                content={t("rejectedTooltip")}
                iconClassName="text-error/40 group-hover:text-error"
              />
            )}
          </div>

          <div className="flex flex-col">
            <span
              className={cn(
                "font-black font-headline tracking-tight group-hover:translate-x-1 transition-transform duration-300",
                compact ? "text-xl" : "text-4xl"
              )}
            >
              {summary.rejectedCount}
            </span>
            {!compact && (
              <p className="text-xs font-medium mt-1 opacity-70 font-body">
                {t("declinedRequestsSubtitle")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
