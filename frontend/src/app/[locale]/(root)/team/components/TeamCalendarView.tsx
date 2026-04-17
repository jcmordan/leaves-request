"use client";

import { GET_TEAM_CALENDAR_QUERY } from "../graphql/TeamQueries";
import { TeamStatsGrid } from "./TeamStatsGrid";
import { TeamCalendarHeader } from "./TeamCalendarHeader";
import { TeamCalendarGrid } from "./TeamCalendarGrid";
import { TeamCapacityInsight } from "./TeamCapacityInsight";
import { parseISO, startOfDay } from "date-fns";
import { useSuspenseQuery } from "@apollo/client/react";

export function TeamCalendarView() {
  const { data } = useSuspenseQuery(GET_TEAM_CALENDAR_QUERY, {
    variables: {
      today: new Date().toISOString().split("T")[0],
      forecastDays: 14,
    },
  });

  const absences = data?.teamAbsences?.nodes || [];
  const stats = data?.leaveRequestSummary;

  const events = absences.map((node) => {
    const start = startOfDay(parseISO(node.startDate));
    const end = startOfDay(parseISO(node.endDate));
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

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

      <TeamStatsGrid
        pendingCount={stats?.pendingCount || 0}
        activeLeaves={stats?.membersOnLeave || 0}
        trendPercentage={stats?.approvedVsLastYearPercentage || 0}
        availablePercentage={stats?.availablePercentage || 100}
      />

      <TeamCalendarGrid events={events} />

      <TeamCapacityInsight message={stats?.insightMessage} />
    </div>
  );
}
