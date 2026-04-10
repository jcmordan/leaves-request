"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { EMPLOYEE_DETAILS_QUERY } from "../graphql/EmployeeDetailsQueries";
import { EmployeeCorporateDataCard } from "./EmployeeCorporateDataCard";
import { EmployeePersonalInformationCard } from "./EmployeePersonalInformationCard";
import { EmployeeProfileHero } from "./EmployeeProfileHero";
import { EmployeeReportingStructureCard } from "./EmployeeReportingStructureCard";
import { EmployeeLeaveBalanceCard } from "./EmployeeLeaveBalanceCard";
import { EmployeeUpcomingEventsCard } from "./EmployeeUpcomingEventsCard";

interface EmployeeDetailsViewProps {
  employeeId: string;
}

export function EmployeeDetailsView({
  employeeId,
}: Readonly<EmployeeDetailsViewProps>) {
  const { data, error } = useSuspenseQuery(EMPLOYEE_DETAILS_QUERY, {
    variables: { id: employeeId },
  });

  if (error || !data?.employee)
    return (
      <div className="flex h-full items-center justify-center bg-surface p-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">
            Error loading employee
          </h2>
          <p className="text-muted-foreground">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );

  const { employee } = data;

  return (
    <main className="flex-1 overflow-y-auto ">
      <div className="mx-auto space-y-8">
        <EmployeeProfileHero employeeRef={employee} />
        <EmployeePersonalInformationCard employeeRef={employee} />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-rows-1 xl:grid-cols-4">
          <EmployeeCorporateDataCard employeeRef={employee} />
          <EmployeeReportingStructureCard employeeRef={employee} />
          <EmployeeLeaveBalanceCard employeeRef={employee} />
          <EmployeeUpcomingEventsCard />
        </div>
      </div>
    </main>
  );
}
