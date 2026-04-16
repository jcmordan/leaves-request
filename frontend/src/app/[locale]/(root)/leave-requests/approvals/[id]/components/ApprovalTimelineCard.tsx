import { Check, Clock, CheckCircle } from "lucide-react";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

interface ApprovalTimelineCardProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    APPROVED: "bg-secondary",
    REJECTED: "bg-error",
    MODIFICATION_REQUESTED: "bg-surface-tint",
    CANCELLED: "bg-outline",
  };
  return colors[action] ?? "bg-primary";
};

/**
 * ApprovalTimelineCard — Vertical timeline of all actions taken on the request.
 * Mirrors the pattern in requests/[id]/components/ApprovalTimelineSection.tsx
 * but styled as a Bento card for the approval view.
 */
export function ApprovalTimelineCard({
  requestRef,
}: ApprovalTimelineCardProps) {
  const t = useTranslations("requests");
  const format = useFormatter();
  const locale = useLocale();
  const request = useFragment(APPROVAL_REQUEST_FIELDS_FRAGMENT, requestRef);

  if (!request) return null;

  const { createdAt, employee, approvalHistories } = request;
  const hasPendingStep = !approvalHistories || approvalHistories.length === 0;

  const formatFullDateTime = (date: string) => {
    return format.dateTime(new Date(date), {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const formatRelativeTime = (date: string) => {
    return dayjs(date).locale(locale).fromNow();
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-4 font-heading">
        {t("timelineTitle")}
      </h2>

      <div className="relative space-y-6">
        {/* Vertical connector */}
        <div className="absolute left-[11px] top-1 bottom-1 w-[2px] bg-surface-container-highest" />

        {/* Step 1: Submission */}
        <div className="relative flex gap-5">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center relative z-10 ring-4 ring-surface-container-lowest shrink-0">
            <Check className="h-3 w-3 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{t("submitted")}</p>
            <p className="text-xs text-on-surface-variant/60 font-medium">
              {`${formatFullDateTime(createdAt)} (${formatRelativeTime(createdAt)})`}
            </p>
            {employee && (
              <p className="text-[11px] text-on-surface-variant/50 mt-1">
                {t("initiatedBy", { name: employee.fullName })}
              </p>
            )}
          </div>
        </div>

        {/* History entries */}
        {approvalHistories?.map((history) => (
          <div key={history.id} className="relative flex gap-5">
            <div
              className={`w-6 h-6 rounded-full ${getActionColor(history.action)} flex items-center justify-center relative z-10 ring-4 ring-surface-container-lowest shrink-0`}
            >
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                {t(`status_${history.action}` as never)}
              </p>
              <p className="text-xs text-on-surface-variant/60 font-medium lowercase first-letter:uppercase">
                {`${formatFullDateTime(history.actionDate)} (${formatRelativeTime(history.actionDate)})`}
              </p>
              {history.approver && (
                <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
                  {history.approver.fullName}
                </p>
              )}
              {history.comment && (
                <p className="text-[11px] text-on-surface-variant/70 mt-1 italic">
                  {history.comment}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Pending placeholder */}
        {hasPendingStep && (
          <div className="relative flex gap-5 opacity-40">
            <div className="w-6 h-6 rounded-full bg-outline-variant flex items-center justify-center relative z-10 ring-4 ring-surface-container-lowest shrink-0">
              <Clock className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant">
                {t("status_PENDING")}
              </p>
              <p className="text-xs text-on-surface-variant/50 font-medium">
                {t("pendingDescription")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
