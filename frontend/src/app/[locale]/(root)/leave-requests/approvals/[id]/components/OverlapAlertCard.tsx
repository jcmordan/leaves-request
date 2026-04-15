import { AlertTriangle, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface OverlapMember {
  name: string;
  role: string;
  dates: string;
}

interface OverlapAlertCardProps {
  startDate: string;
  endDate: string;
}

// Static data matching the Stitch design — will be replaced with API data
// when the teamAbsences query supports overlap detection.
const MOCK_OVERLAPS: readonly OverlapMember[] = [
  {
    name: "Sarah Wilson",
    role: "Product Designer",
    dates: "Oct 25 – Oct 27",
  },
  {
    name: "Marcus Chen",
    role: "Frontend Developer",
    dates: "Oct 24 – Oct 26",
  },
] as const;

/**
 * OverlapAlertCard — Warns managers about team members absent during the same period.
 * Currently uses static mock data; will integrate with teamAbsences query when available.
 */
export function OverlapAlertCard({ startDate, endDate }: OverlapAlertCardProps) {
  const t = useTranslations("requests");
  const overlaps = MOCK_OVERLAPS;

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
        {t("teamOverlapsCount", { count: overlaps.length })}
      </p>

      <div className="space-y-3">
        {overlaps.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-4 bg-white/60 rounded-lg p-3 border border-amber-100"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary truncate">
                {member.name}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 font-medium">
                {member.role}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-amber-700 font-medium shrink-0">
              <Calendar className="h-3 w-3" />
              <span>{member.dates}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
