"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { GET_APPROVALS_DASHBOARD_QUERY } from "../graphql/ApprovalListQueries";
import { RequestStatus } from "@/__generated__/graphql";
import { RequestsTable } from "../../shared/components/RequestsTable";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardMetricCards } from "./DashboardMetricCards";
import { DashboardCapacityCard } from "./DashboardCapacityCard";
import { DashboardInsightCard } from "./DashboardInsightCard";


/**
 * TeamApprovalsView Client Component
 * Orchestrates fetching of team leave requests and dashboard summary for manager overview.
 */
export default function TeamApprovalsView() {
  const searchParams = useSearchParams();
  const t = useTranslations("requests");

  // Anchoring "Today" to the local date at component mount.
  // We use useState to keep this value stable across Suspense re-renders and avoid UTC rollover issues.
  const [today] = useState(() => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    return `${YYYY}-${MM}-${DD}T00:00:00Z`;
  });

  const after = searchParams.get("after");
  const before = searchParams.get("before");
  const statusParam = searchParams.get("status");

  const status = Object.values(RequestStatus).includes(
    statusParam?.toUpperCase() as RequestStatus,
  )
    ? (statusParam?.toUpperCase() as RequestStatus)
    : undefined;

  const PAGE_SIZE = 10;
  
  const variables = useMemo(() => before
    ? { last: PAGE_SIZE, before, status, today }
    : { first: PAGE_SIZE, after: after ?? undefined, status, today },
    [before, after, status, today]);

  const { data } = useSuspenseQuery(GET_APPROVALS_DASHBOARD_QUERY, {
    variables,
  });

  const teamRequestsConnection = data?.teamAbsences;
  const summary = data?.leaveRequestSummary;

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-y-auto min-h-screen animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-primary tracking-tight font-headline">
            {t("teamApprovalsTitle")}
          </h3>
          <p className="text-on-surface-variant/70 font-body text-sm">
            {t("teamApprovalsDescription")}
          </p>
        </div>
      </div>

      {/* Analysis Row: Capacity + Metric Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
        <div className="lg:col-span-4 flex">
          {summary && <DashboardCapacityCard summaryRef={summary} />}
        </div>
        <div className="lg:col-span-8 flex">
          {summary && <DashboardMetricCards summaryRef={summary} />}
        </div>
      </div>

      {/* Insight Row: Manager Tips (Full Width) */}
      <div className="mb-8">
        {summary && <DashboardInsightCard summaryRef={summary} />}
      </div>

      {/* Main Table Section (Full Width) */}
      <div className="w-full">
        <RequestsTable
          requestsRef={teamRequestsConnection as any}
          basePath="approvals"
        />
      </div>
    </div>
  );
}
