import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

// Static capacity value per the Stitch design — will be replaced
// with a real calculation from teamAbsences when the API supports it.
const CAPACITY_PERCENTAGE = 85;

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * TeamCapacityCard — Visual representation of team availability as a circular progress chart.
 * Uses static data for now, consistent with the Stitch design.
 */
export function TeamCapacityCard() {
  const t = useTranslations("requests");

  const offset =
    CIRCLE_CIRCUMFERENCE - (CAPACITY_PERCENTAGE / 100) * CIRCLE_CIRCUMFERENCE;

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
              percentage: CAPACITY_PERCENTAGE,
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
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="stroke-secondary transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-primary font-heading">
              {t("capacityPercentage", { percentage: CAPACITY_PERCENTAGE })}
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
              {t("available")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
