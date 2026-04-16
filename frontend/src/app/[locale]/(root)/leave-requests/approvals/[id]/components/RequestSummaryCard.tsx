import { Calendar, Clock, MedicalServices } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";

interface RequestSummaryCardProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

/**
 * RequestSummaryCard component - Displays the core details of the absence request.
 */
export function RequestSummaryCard({ requestRef }: RequestSummaryCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const request = useFragment(APPROVAL_REQUEST_FIELDS_FRAGMENT, requestRef);

  if (!request) return null;

  const {
    absenceType,
    startDate,
    endDate,
    totalDaysRequested,
    createdAt,
  } = request;

  const formatDate = (dateStr: string) =>
    format.dateTime(new Date(dateStr), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    
    return `${format.dateTime(s, { month: "short", day: "numeric" })} - ${format.dateTime(e, { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const formatTime = (dateStr: string) =>
    format.dateTime(new Date(dateStr), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Matching common patterns
    });

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-4 font-heading">
        {t("requestDetails")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Absence Type */}
        <div className="space-y-1">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            {t("absenceType")}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="font-headline font-extrabold text-primary">
              {absenceType?.name ?? t("unknown")}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-1">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            {t("duration")}
          </p>
          <p className="font-headline font-extrabold text-primary">
            {formatDateRange(startDate, endDate)}
          </p>
          <p className="text-xs text-on-surface-variant font-medium">
            {t("daysCount", { count: totalDaysRequested })}
          </p>
        </div>

        {/* Submission Date */}
        <div className="space-y-1">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            {t("submissionDate")}
          </p>
          <p className="font-headline font-extrabold text-primary">
            {formatDate(createdAt)}
          </p>
          <p className="text-xs text-on-surface-variant font-medium">
            {formatTime(createdAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
