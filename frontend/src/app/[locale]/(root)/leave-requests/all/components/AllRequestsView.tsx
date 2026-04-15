"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { ALL_REQUESTS_QUERY } from "../graphql/AdministrationQueries";
import { RequestStatus } from "@/__generated__/graphql";
import { RequestsTable } from "../../components/RequestsTable";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * AllRequestsView Client Component
 * Orchestrates fetching of all leave requests for HR administration.
 */
export default function AllRequestsView() {
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

  const { data } = useSuspenseQuery(ALL_REQUESTS_QUERY, {
    variables,
  });

  // Handle hypothetical different result shapes for absenceRequests
  const allRequestsConnection = data?.absenceRequests;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto overflow-y-auto min-h-screen">
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-primary tracking-tight font-headline">
          {t("allRequestsTitle")}
        </h3>
        <p className="text-on-surface-variant font-body">{t("allRequestsDescription")}</p>
      </div>

      <div className="space-y-4">
        <RequestsTable 
          requestsRef={allRequestsConnection as any} 
          basePath="all"
        />
      </div>
    </div>
  );
}
