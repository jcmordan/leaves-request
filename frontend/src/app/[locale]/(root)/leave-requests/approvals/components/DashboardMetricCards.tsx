"use client";

import { FragmentType } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../graphql/ApprovalListQueries";
import { PendingCountCard } from "./PendingCountCard";
import { ActivityTrackingCard } from "./ActivityTrackingCard";
import { LeaveTrendsCard } from "./LeaveTrendsCard";
import RejectedCountCard from "./RejectedCountCard";

interface DashboardMetricCardsProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
}

/**
 * DashboardMetricCards — Composite layout for top-level dashboard metrics.
 * Arranges the summary cards in a responsive grid.
 */
export function DashboardMetricCards({ summaryRef }: DashboardMetricCardsProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <div className="md:col-span-6 flex md:aspect-[1.5/1]">
        <PendingCountCard summaryRef={summaryRef} />
      </div>
      <div className="md:col-span-6 flex md:aspect-[1.5/1]">
        <RejectedCountCard summaryRef={summaryRef} />
      </div>
      <div className="md:col-span-6 flex md:aspect-[1.5/1]">
        <ActivityTrackingCard summaryRef={summaryRef} />
      </div>
      <div className="md:col-span-6 flex md:aspect-[1.5/1]">
        <LeaveTrendsCard summaryRef={summaryRef} />
      </div>
    </div>
  );
}
