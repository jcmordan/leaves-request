"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuspenseQuery } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { ArrowLeft, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RequestOverviewSection } from "./RequestOverviewSection";
import { MedicalDetailsSection } from "./MedicalDetailsSection";
import { ApprovalTimelineSection } from "./ApprovalTimelineSection";
import { ApproverCard } from "./ApproverCard";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { CancelRequestModal } from "@/components/requests/CancelRequestModal";
import { GET_REQUEST_DETAIL_QUERY } from "../graphql/RequestDetailsQueries";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
  PENDING_COORDINATOR_APPROVAL:
    "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
  APPROVED: "bg-secondary-container/30 text-secondary border-secondary/20",
  REJECTED: "bg-error-container/30 text-error border-error/20",
  CANCELLED: "bg-outline/10 text-outline border-outline/20",
  MODIFICATION_REQUESTED:
    "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
};

const CANCELLABLE_STATUSES = new Set(["PENDING", "PENDING_COORDINATOR_APPROVAL"]);

/**
 * RequestDetailView Client Component
 * Uses useSuspenseQuery to fetch request details and orchestrates section rendering.
 */
export default function RequestDetailView() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("requests");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data } = useSuspenseQuery(GET_REQUEST_DETAIL_QUERY, {
    variables: { id },
  });

  const request = data?.request;

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-on-surface-variant/60">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-error/50" />
          <p className="text-sm font-bold">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  const statusBadgeClass =
    STATUS_BADGE[request.status] ?? STATUS_BADGE["PENDING"];
  const canCancel = CANCELLABLE_STATUSES.has(request.status);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <Link
              href="/requests/me"
              className="label-sm hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("title")}
            </Link>
            <span className="text-on-surface-variant/30">/</span>
            <span className="label-sm text-primary">
              {request.id.slice(0, 8).toUpperCase()}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <h1 className="headline-md text-primary">{t("detailsTitle")}</h1>
            <span
              className={`px-3 py-1 rounded-full border border-transparent flex items-center gap-1.5 label-sm ${statusBadgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {t(`status_${request.status}` as any)}
            </span>
          </div>
        </div>

        {canCancel && (
          <div className="flex gap-3 shrink-0">
            <Button
              variant="destructive"
              id="cancel-request-btn"
              onClick={() => setIsCancelModalOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              {t("cancel")}
            </Button>
          </div>
        )}
      </div>

      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        requestRef={request}
        onSuccess={() => setIsCancelModalOpen(false)}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          <RequestOverviewSection requestRef={request} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <MedicalDetailsSection requestRef={request} />
            <AdditionalInfoSection requestRef={request} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 sticky top-8">
          <ApproverCard requestRef={request} />
          <ApprovalTimelineSection requestRef={request} />
        </div>
      </div>
    </div>
  );
}
