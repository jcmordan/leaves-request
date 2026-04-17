"use client";

import { GET_TEAM_CALENDAR_QUERY } from "../graphql/TeamQueries";
import { parseISO, startOfDay } from "date-fns";
import { useSuspenseQuery } from "@apollo/client/react";
import { useState } from "react";
import { TeamCalendarHeader } from "./TeamCalendarHeader";
import { TeamCalendarGrid } from "./TeamCalendarGrid";
import { DashboardCapacityCard } from "../../leave-requests/shared/components/dashboard/DashboardCapacityCard";
import { DashboardMetricCards } from "../../leave-requests/shared/components/dashboard/DashboardMetricCards";
import { DashboardInsightCard } from "../../leave-requests/shared/components/dashboard/DashboardInsightCard";

/**
 * TeamCalendarView Client Component
 * Provides a comprehensive team leave calendar with integrated capacity analytics.
 */
export function TeamCalendarView() {
  // Anchoring "Today" to the local date at component mount to ensure consistency with ApprovalsView.
  const [today] = useState(() => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    return `${YYYY}-${MM}-${DD}T00:00:00Z`;
  });

  const { data } = useSuspenseQuery(GET_TEAM_CALENDAR_QUERY, {
    variables: {
      today,
      forecastDays: 14,
    },
  });

  const absences = data?.teamAbsences?.nodes || [];
  const summary = data?.leaveRequestSummary;

  const events = absences.map((node) => {
    const start = startOfDay(parseISO(node.startDate));
    const end = startOfDay(parseISO(node.endDate));
    const duration = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    return {
      id: node.id,
      title: `${node.employee.fullName} - ${node.absenceType.name}`,
      start,
      end,
      status: node.status,
      type: node.absenceType.name,
      employeeName: node.employee.fullName,
      duration,
      allDay: true,
    };
  });

  const handleNewRequest = () => {
    // Navigate or open modal - implementation depends on existing routing
    console.log("New Request triggered");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <TeamCalendarHeader onNewRequest={handleNewRequest} />

      {/* Synchronized Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        <div className="lg:col-span-3 flex">
          {summary && <DashboardCapacityCard summaryRef={summary} compact={true} />}
        </div>
        <div className="lg:col-span-9 flex">
          {summary && (
            <DashboardMetricCards
              summaryRef={summary}
              showRejected={false}
              variant="horizontal"
              compact={true}
            />
          )}
        </div>
      </div>

      <div className="mb-8">
        {summary && <DashboardInsightCard summaryRef={summary} />}
      </div>

      <TeamCalendarGrid events={events} />
    </div>
  );
}
