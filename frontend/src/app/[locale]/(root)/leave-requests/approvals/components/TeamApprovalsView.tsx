"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { TEAM_ABSENCES_QUERY } from "../graphql/ApprovalListQueries";
import { RequestStatus } from "@/__generated__/graphql";
import { RequestsTable } from "../../shared/components/RequestsTable";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * TeamApprovalsView Client Component
 * Orchestrates fetching of team leave requests for manager approval.
 */
export default function TeamApprovalsView() {
  const searchParams = useSearchParams();
  const t = useTranslations("requests");

  const after = searchParams.get("after");
  const before = searchParams.get("before");
  const statusParam = searchParams.get("status");

  const status = Object.values(RequestStatus).includes(
    statusParam?.toUpperCase() as RequestStatus,
  )
    ? (statusParam?.toUpperCase() as RequestStatus)
    : undefined;

  const PAGE_SIZE = 10;
  const variables = before
    ? { last: PAGE_SIZE, before, status }
    : { first: PAGE_SIZE, after: after ?? undefined, status };

  const { data } = useSuspenseQuery(TEAM_ABSENCES_QUERY, {
    variables,
  });

  const teamRequestsConnection = data?.teamAbsences;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto overflow-y-auto min-h-screen">
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-primary tracking-tight font-headline">
          {t("teamApprovalsTitle")}
        </h3>
        <p className="text-on-surface-variant font-body">{t("teamApprovalsDescription")}</p>
      </div>

      <div className="space-y-4">
        <RequestsTable 
          requestsRef={teamRequestsConnection as any} 
          basePath="approvals"
        />
      </div>
    </div>
  );
}
