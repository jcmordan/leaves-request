import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { REQUEST_DETAIL_FRAGMENT } from "../graphql/RequestDetailsQueries";

interface RequestOverviewSectionProps {
  requestRef: FragmentType<typeof REQUEST_DETAIL_FRAGMENT>;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * Displays the core overview card: absence type, dates, and duration.
 */
export function RequestOverviewSection({
  requestRef,
}: RequestOverviewSectionProps) {
  const t = useTranslations("requests");
  const request = useFragment(REQUEST_DETAIL_FRAGMENT, requestRef);

  const {
    startDate,
    endDate,
    totalDaysRequested,
    absenceType,
    reason,
    employee,
  } = request;

  return (
    <section className="content-card p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-bold text-primary font-heading mb-1">
            {t("overviewTitle")}
          </h3>
          <p className="text-sm text-on-surface-variant font-medium">
            {t("overviewSubtitle")}
          </p>
        </div>
        <div className="text-right">
          <span className="label-sm block mb-1">{t("totalDuration")}</span>
          <span className="text-3xl font-black text-secondary font-heading">
            {totalDaysRequested}{" "}
            {totalDaysRequested === 1 ? t("day") : t("days")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="space-y-1">
          <p className="label-sm mb-1">{t("type")}</p>
          <p className="text-sm font-bold text-primary">
            {absenceType?.name ?? "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="label-sm mb-1">{t("startDate")}</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-secondary shrink-0" />
            <p className="text-sm font-bold text-primary">
              {formatDate(startDate)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="label-sm mb-1">{t("endDate")}</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-secondary shrink-0" />
            <p className="text-sm font-bold text-primary">
              {formatDate(endDate)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="label-sm mb-1">{t("requestedFor")}</p>
          <p className="text-sm font-bold text-primary">
            {employee?.fullName ?? "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
