import { FileX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFragment, FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";

interface RejectedCountCardProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * RejectedCountCard Component
 * Displays the total number of rejected requests with a distinct error theme.
 */
export default function RejectedCountCard({ summaryRef }: RejectedCountCardProps) {
  const t = useTranslations("requests");
  const summary = useFragment(DASHBOARD_SUMMARY_FIELDS, summaryRef);

  return (
    <div className="w-full h-full p-6 rounded-xl bg-linear-to-br from-error/10 to-error/5 text-error shadow-sm border border-error/10 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      {/* Background Decorative Icon */}
      <FileX 
        className="absolute -right-6 -bottom-6 h-40 w-40 text-error/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" 
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10 text-error border border-error/10 backdrop-blur-sm">
                <FileX className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-80 font-headline">
                {t("rejectedTotal")}
              </span>
            </div>
            <DashboardInfoTooltip 
              content={t("rejectedTooltip")} 
              iconClassName="text-error/40 group-hover:text-error"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-4xl font-black font-headline tracking-tight group-hover:translate-x-1 transition-transform duration-300">
              {summary.rejectedCount}
            </span>
            <p className="text-xs font-medium mt-1 opacity-70 font-body">
              {t("declinedRequestsSubtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
