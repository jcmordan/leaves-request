"use client";

import { useTranslations } from "next-intl";
import { PaginatedDataTable } from "@/components/ui/paginated-data-table";
import { useEmployeeColumns } from "./EmployeeColumns";
import { EmployeeEmptyState } from "./EmployeeEmptyState";
import { FragmentType, useFragment } from "@/__generated__";
import { EMPLOYEE_CONNECTION_FRAGMENT } from "@/app/[locale]/(root)/employees/graphql/EmployeeQueries";
import { GetEmployees_EmployeeFragment } from "@/__generated__/graphql";


// The data structure from GraphQL
export type Employee = NonNullable<
  GetEmployees_EmployeeFragment["edges"]
>[number]["node"];

interface Props {
  variables: any;
  onClearSearch?: () => void;
  employeesRef?: FragmentType<typeof EMPLOYEE_CONNECTION_FRAGMENT> | null;
}

/**
 * EmployeeTable presents the list of employees with pagination controls.
 */
export function EmployeeTable({ onClearSearch, employeesRef }: Props) {
  const employees = useFragment(EMPLOYEE_CONNECTION_FRAGMENT, employeesRef);

  const columns = useEmployeeColumns();

  if (!employees || employees.edges?.length === 0) {
    return <EmployeeEmptyState onClearSearch={onClearSearch} />;
  }

  const nodes = employees.edges?.map((edge) => ({ ...edge?.node })) ?? [];

  return (
    <div className="space-y-4">
      <PaginatedDataTable
        columns={columns}
        data={nodes as any}
        pageInfo={employees.pageInfo}
        containerClassName="rounded-xl border border-outline-variant/10 bg-white/50 backdrop-blur-md overflow-hidden shadow-sm flex flex-col"
        className="w-full h-full"
      />
    </div>
  );
}

