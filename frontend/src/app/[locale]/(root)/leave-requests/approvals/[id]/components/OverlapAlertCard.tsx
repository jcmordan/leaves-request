import { FragmentType, useFragment } from "@/__generated__";
import { AlertTriangle, Calendar } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { ABSENCE_ANALYSIS_OVERLAPS_FRAGMENT } from "../graphql/ApprovalQueries";

interface OverlapAlertCardProps {
  absenceAnalysisRef?: FragmentType<
    typeof ABSENCE_ANALYSIS_OVERLAPS_FRAGMENT
  > | null;
}

/**
 * OverlapAlertCard — Warns managers about team members absent during the same period.
 * Integrates with real data from the AbsenceRequest fragment.
 */
export function OverlapAlertCard({
  absenceAnalysisRef,
}: OverlapAlertCardProps) {
  const overlaps = useFragment(
    ABSENCE_ANALYSIS_OVERLAPS_FRAGMENT,
    absenceAnalysisRef,
  );
  const t = useTranslations("requests");
  const format = useFormatter();

  const formatDate = (date: string) => {
    return format.dateTime(new Date(date), {
      month: "short",
      day: "numeric",
    });
  };

  if (!overlaps?.overlappingAbsences) {
    return null;
  }

  return (
    <section className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-amber-200/40 pb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <h2 className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] font-heading">
          {t("overlappingAbsences")}
        </h2>
      </div>

      <p className="text-xs font-bold text-amber-700 mb-4">
        {t("teamOverlapsCount", { count: overlaps.overlappingAbsences.length })}
      </p>

      <div className="space-y-3">
        {overlaps.overlappingAbsences.map((member) => (
          <div
            key={member.employeeName}
            className="flex items-center gap-4 bg-white/60 rounded-lg p-3 border border-amber-100"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
              {member.employeeName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary truncate">
                {member.employeeName}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 font-medium">
                {member.jobTitle}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-amber-700 font-medium shrink-0">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(member.startDate)} – {formatDate(member.endDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
