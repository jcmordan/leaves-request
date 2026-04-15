import { ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ApprovalHeaderProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

/**
 * ApprovalHeader component - Displays breadcrumbs, employee profile and request status.
 */
export function ApprovalHeader({ requestRef }: ApprovalHeaderProps) {
  const t = useTranslations("requests");
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
          <Avatar className="w-16 h-16 rounded-xl ring-4 ring-surface-container-high ring-offset-2 ring-offset-surface">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.fullName}`}
              alt={employee?.fullName ?? ""}
            />
            <AvatarFallback className="rounded-xl bg-primary text-white font-bold">
              {employee?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-black text-primary font-heading tracking-tight mb-0.5">
              {employee?.fullName}
            </h1>
            <p className="text-sm font-medium text-on-surface-variant">
              {employee?.jobTitle?.name ?? "Team Member"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 shadow-sm ${
              status === "PENDING"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : status === "APPROVED"
                  ? "bg-secondary-container border-secondary text-on-secondary-container"
                  : "bg-error-container border-error text-on-error-container"
            }`}
          >
            {status === "PENDING" && (
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
            )}
            <span className="font-headline font-bold text-xs uppercase tracking-widest">
              {t("status")}: {t(`status_${status}`)}
            </span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
