import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { ABSENCE_ANALYSIS_STATS_FRAGMENT } from "../graphql/ApprovalQueries";

interface TeamCapacityCardProps {
  absenceAnalysisRef?: FragmentType<
    typeof ABSENCE_ANALYSIS_STATS_FRAGMENT
  > | null;
}

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * TeamCapacityCard — Visual representation of team availability as a circular progress chart.
 * Integrates with real data from the AbsenceRequest fragment.
 */
export function TeamCapacityCard({
  absenceAnalysisRef,
}: TeamCapacityCardProps) {
  const t = useTranslations("requests");
  const absenceAnalysys = useFragment(
    ABSENCE_ANALYSIS_STATS_FRAGMENT,
    absenceAnalysisRef,
  );

  if (!absenceAnalysys) {
    return null;
  }

  const {
    availablePercentage, // This is current available (Total - Approved)
    totalTeamMembers,
    membersOnLeave,
    pendingMembersOnLeave,
  } = absenceAnalysys;

  // Percentage of pending impact
  const pendingPercentage = totalTeamMembers > 0
    ? (pendingMembersOnLeave / totalTeamMembers) * 100
    : 0;

  // Final available percentage if all pending are approved
  const potentialAvailablePercentage = Math.max(0, availablePercentage - pendingPercentage);

  // Offset for Current Reality (Available + Pending)
  // This defines the outer boundary of the pending segment
  const currentRealityOffset =
    CIRCLE_CIRCUMFERENCE - (availablePercentage / 100) * CIRCLE_CIRCUMFERENCE;

  // Offset for Potential Reality (Only Available after pending)
  // This defines the boundary of the green segment
  const potentialRealityOffset =
    CIRCLE_CIRCUMFERENCE - (potentialAvailablePercentage / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-surface-container-low pb-4">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-heading">
          {t("teamCapacity")}
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
            aria-label={t("capacityPercentage", {
              percentage: availablePercentage,
            })}
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-surface-container-high"
            />
            {/* Pending segment (impact) */}
            <circle
              cx="60"
              cy="60"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={currentRealityOffset}
              className="stroke-amber-500 transition-all duration-700 ease-out"
            />
            {/* Progress circle (Potential Available - purely available) */}
            <circle
              cx="60"
              cy="60"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={potentialRealityOffset}
              className="stroke-secondary transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-primary font-heading">
              {availablePercentage}%
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest text-center">
              {t("available")}
            </span>
          </div>
        </div>

        <div className="mt-8 w-full grid grid-cols-1 gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low rounded-lg p-3 text-center">
              <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider mb-1">
                {t("totalMembers")}
              </p>
              <p className="text-lg font-black text-primary font-heading">
                {totalTeamMembers}
              </p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-3 text-center border-b-2 border-secondary">
              <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider mb-1">
                {t("onLeave")}
              </p>
              <p className="text-lg font-black text-secondary font-heading">
                {membersOnLeave}
              </p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-3 text-center border-b-2 border-amber-500">
              <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider mb-1">
                {t("pendingRequests")}
              </p>
              <p className="text-lg font-black text-amber-500 font-heading">
                {pendingMembersOnLeave}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
