"use client";

import { FragmentType, useFragment } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../graphql/RequestFragments";
import { PendingCountCard } from "./PendingCountCard";
import { ActivityTrackingCard } from "./ActivityTrackingCard";
import { LeaveTrendsCard } from "./LeaveTrendsCard";
import { RejectedCountCard } from "./RejectedCountCard";
import { cn } from "@/lib/utils";

/**
 * Props for DashboardMetricCards Component.
 */
interface DashboardMetricCardsProps {
  summaryRef: FragmentType<typeof DASHBOARD_SUMMARY_FIELDS>;
  showRejected?: boolean;
  variant?: "grid" | "horizontal";
  compact?: boolean;
}

/**
 * DashboardMetricCards — Composite layout for top-level dashboard metrics.
 * Arranges the summary cards in a responsive grid.
 */
export function DashboardMetricCards({
  summaryRef,
  showRejected = true,
  variant = "grid",
  compact = false,
}: DashboardMetricCardsProps) {
  const isHorizontal = variant === "horizontal";

  return (
    <div
      className={cn(
        "w-full grid gap-6 items-stretch",
        isHorizontal ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-12"
      )}
    >
      <div
        className={cn(
          "flex",
          isHorizontal ? "col-span-1" : "md:col-span-6 md:aspect-[1.5/1]"
        )}
      >
        <PendingCountCard summaryRef={summaryRef} compact={compact} />
      </div>

      {showRejected && (
        <div
          className={cn(
            "flex",
            isHorizontal ? "col-span-1" : "md:col-span-6 md:aspect-[1.5/1]"
          )}
        >
          <RejectedCountCard summaryRef={summaryRef} compact={compact} />
        </div>
      )}

      <div
        className={cn(
          "flex",
          isHorizontal ? "col-span-1" : "md:col-span-6 md:aspect-[1.5/1]"
        )}
      >
        <ActivityTrackingCard summaryRef={summaryRef} compact={compact} />
      </div>

      <div
        className={cn(
          "flex",
          isHorizontal ? "col-span-1" : "md:col-span-6 md:aspect-[1.5/1]"
        )}
      >
        <LeaveTrendsCard summaryRef={summaryRef} compact={compact} />
      </div>
    </div>
  );
}
