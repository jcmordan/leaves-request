"use client";

import { useParams } from "next/navigation";
import { useSuspenseQuery } from "@apollo/client/react";
import { GET_APPROVAL_DETAIL_QUERY } from "../graphql/ApprovalQueries";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ApprovalHeader } from "./ApprovalHeader";
import { RequestSummaryCard } from "./RequestSummaryCard";
import { MedicalDocumentationCard } from "./MedicalDocumentationCard";
import { ApprovalActionCard } from "./ApprovalActionCard";
import { OverlapAlertCard } from "./OverlapAlertCard";
import { TeamCapacityCard } from "./TeamCapacityCard";
import { ApprovalTimelineCard } from "./ApprovalTimelineCard";

/**
 * ApprovalView Client Component
 * Orchestrates the Bento grid layout based on the Stitch design.
 */
export default function ApprovalView() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("requests");

  const { data } = useSuspenseQuery(GET_APPROVAL_DETAIL_QUERY, {
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header: Breadcrumbs, Employee Profile, Status */}
      <ApprovalHeader requestRef={request} />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (spans 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <RequestSummaryCard requestRef={request} />
          <MedicalDocumentationCard requestRef={request} />
          <ApprovalActionCard
            requestId={request.id}
            status={request.status}
          />
        </div>

        {/* Right column (sidebar) */}
        <div className="space-y-6">
          <OverlapAlertCard
            startDate={request.startDate}
            endDate={request.endDate}
          />
          <TeamCapacityCard />
          <ApprovalTimelineCard requestRef={request} />
        </div>
      </div>
    </div>
  );
}
