"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { MY_REQUESTS_QUERY } from "../graphql/MyRequestsQueries";
import { RequestStatus } from "@/__generated__/graphql";
import { RequestSummaryCards } from "./RequestSummaryCards";
import { LeaveBalanceSection } from "./LeaveBalanceSection";
import { RequestsTable } from "../../components/RequestsTable";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * MyRequestsView Client Component
 * Orchestrates fetching of leave requests and balance data.
 * Adheres to the SSR + useSuspenseQuery pattern.
 */
export default function MyRequestsView() {
  const searchParams = useSearchParams();
  const t = useTranslations("requests");

  const after = searchParams.get("after");
  const before = searchParams.get("before");
  const statusParam = searchParams.get("status");

  // Validate status parameter
  const status = Object.values(RequestStatus).includes(
    statusParam?.toUpperCase() as RequestStatus,
  )
    ? (statusParam?.toUpperCase() as RequestStatus)
    : undefined;

  const PAGE_SIZE = 10;
  const variables = before
    ? { last: PAGE_SIZE, before, status }
    : { first: PAGE_SIZE, after: after ?? undefined, status };

  const { data } = useSuspenseQuery(MY_REQUESTS_QUERY, {
    variables,
  });

  const myRequestsConnection = data?.myRequests;
  const myBalance = data?.myBalance;

  return (
    <div
      id="my-requests"
      className="flex-1 p-8 max-w-400 mx-auto overflow-y-auto min-h-screen"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-primary tracking-tight font-headline">
          {t("title")}
        </h3>
        <p className="text-on-surface-variant font-body">{t("description")}</p>
      </div>

      {/* Main Content Grid (12 Columns) */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* LEFT COLUMN: Leave Balance (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex">
          <LeaveBalanceSection balanceRef={myBalance} />
        </div>

        {/* RIGHT COLUMN: Status Grid (8 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <RequestSummaryCards myBalanceRef={myBalance} />
        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="space-y-4">
        <RequestsTable requestsRef={myRequestsConnection} />
      </div>
    </div>
  );
}
