import { Check, Clock, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { REQUEST_DETAIL_FRAGMENT } from "../graphql/RequestDetailsQueries";
import { fromNow, fullDateTime } from "@/utils/dateUtils";

interface ApprovalTimelineSectionProps {
  requestRef: FragmentType<typeof REQUEST_DETAIL_FRAGMENT>;
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
 * Renders the approval history as a vertical timeline with the initial
 * submission step always shown at the top.
 */
export function ApprovalTimelineSection({
  requestRef,
}: ApprovalTimelineSectionProps) {
  const t = useTranslations("requests");
  const request = useFragment(REQUEST_DETAIL_FRAGMENT, requestRef);

  const { createdAt, requesterEmployee, approvalHistories } = request;
  const hasPendingStep = !approvalHistories || approvalHistories.length === 0;

  return (
    <section className="content-card p-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-8">
        {t("timelineTitle")}
      </h3>

      <div className="relative space-y-8">
        {/* Vertical connector line */}
        <div className="absolute left-[11px] top-1 bottom-1 w-[2px] bg-surface-container-highest" />

        {/* Step 1: Submission — always present */}
        <div className="relative flex gap-6">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center relative z-10 ring-4 ring-white shrink-0">
            <Check className="h-3 w-3 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{t("submitted")}</p>
            <p className="text-xs text-on-surface-variant/60 font-medium">
              {`${fullDateTime(createdAt)} (${fromNow(createdAt)})`}
            </p>
            {requesterEmployee && (
              <p className="text-[11px] text-on-surface-variant/50 mt-1">
                {t("initiatedBy", { name: requesterEmployee.fullName })}
              </p>
            )}
          </div>
        </div>

        {/* Approval history entries */}
        {approvalHistories?.map((history) => (
          <div key={history.id} className="relative flex gap-6">
            <div
              className={`w-6 h-6 rounded-full ${getActionColor(history.action)} flex items-center justify-center relative z-10 ring-4 ring-white shrink-0`}
            >
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                {t(`status_${history.action}` as any)}
              </p>
              <p className="label-sm lowercase first-letter:uppercase mb-1">
                {`${fullDateTime(history.actionDate)} (${fromNow(history.actionDate)})`}
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

        {/* Pending placeholder when no approvals yet */}
        {hasPendingStep && (
          <div className="relative flex gap-6 opacity-40">
            <div className="w-6 h-6 rounded-full bg-outline-variant flex items-center justify-center relative z-10 ring-4 ring-white shrink-0">
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
