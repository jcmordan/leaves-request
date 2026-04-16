import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";
import { EmployeeAvatar } from "@/components/common/EmployeeAvatar";
import { RequestStatusBadge } from "../../../shared/components/RequestStatusBadge";

interface ApprovalHeaderProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

/**
 * ApprovalHeader component - Displays breadcrumbs, employee profile and request status.
 */
export function ApprovalHeader({ requestRef }: ApprovalHeaderProps) {
  const t = useTranslations("requests");
  const ct = useTranslations("common");
  const request = useFragment(APPROVAL_REQUEST_FIELDS_FRAGMENT, requestRef);

  if (!request) return null;

  const { employee, status } = request;

  return (
    <header className="mb-10 flex flex-col md:items-start justify-between gap-6">
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
        <span>{t("approvals")}</span>
        <ChevronRight className="h-3 w-3 text-on-surface-variant/40" />
        <span className="text-primary font-black">{t("absenceRequest")}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end w-full justify-between gap-6">
        <div className="flex items-center gap-5">
          <EmployeeAvatar
            fullName={employee?.fullName ?? ""}
            avatarClassName="h-25 w-25"
          />
          <div>
            <h1 className="text-4xl font-black text-primary font-heading tracking-tight mb-0.5">
              {employee?.fullName}
            </h1>
            <p className="text-sm font-medium text-on-surface-variant">
              {employee?.jobTitle?.name ?? ct("teamMember")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RequestStatusBadge
            status={status}
            className="px-4 py-2 rounded-lg border-2 text-xs font-black uppercase tracking-widest shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
