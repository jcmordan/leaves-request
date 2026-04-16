import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { RequestStatus } from "@/__generated__/graphql";

interface RequestStatusBadgeProps {
  /**
   * Status of the request
   */
  status: RequestStatus | string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the pulse dot
   * @default true
   */
  showDot?: boolean;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
  PENDING_COORDINATOR_APPROVAL:
    "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
  APPROVED: "bg-secondary-container/30 text-secondary border-secondary/20",
  REJECTED: "bg-error-container/30 text-error border-error/20",
  CANCELLED: "bg-outline/10 text-outline border-outline/20",
  MODIFICATION_REQUESTED:
    "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
};

/**
 * RequestStatusBadge Component
 * A shared component to display the status of a leave request with consistent styling.
 */
export function RequestStatusBadge({
  status,
  className,
  showDot = true,
}: RequestStatusBadgeProps) {
  const t = useTranslations("requests");
  const normalizedStatus = status.toUpperCase();
  const badgeClass =
    STATUS_BADGE_STYLES[normalizedStatus] ?? STATUS_BADGE_STYLES["PENDING"];

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full border border-transparent flex items-center justify-center gap-1.5 label-sm whitespace-nowrap",
        badgeClass,
        className,
      )}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {t(`status_${normalizedStatus}` as any)}
    </span>
  );
}
