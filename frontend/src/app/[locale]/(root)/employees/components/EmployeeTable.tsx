"use client";

import { useTranslations } from "next-intl";
import { Search, User, RotateCcw } from "lucide-react";

import { PaginatedDataTable } from "@/components/ui/paginated-data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useEmployeeColumns } from "./EmployeeColumns";
import { FragmentType, useFragment } from "@/__generated__";
import { EMPLOYEE_CONNECTION_FRAGMENT } from "../graphql/EmployeeQueries";
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

  const t = useTranslations("employees");
  const columns = useEmployeeColumns();

  if (!employees || employees.edges?.length === 0) {
    return (
      <EmptyState
        title={t("emptyStateTitle")}
        description={t("emptyStateDescription")}
        icon={Search}
        secondaryIcon={User}
        action={
          onClearSearch
            ? {
                label: t("clearSearch"),
                onClick: onClearSearch,
                icon: RotateCcw,
              }
            : undefined
        }
      />
    );
  }

  const nodes = employees.edges?.map((edge) => ({ ...edge?.node })) ?? [];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10">
      <PaginatedDataTable
        columns={columns}
        data={nodes as any}
        pageInfo={employees.pageInfo}
        density={"comfortable"}
        // containerClassName="rounded-xl border border-outline-variant/10 bg-white/50 backdrop-blur-md overflow-hidden shadow-sm flex flex-col"
        // className="w-full h-full"
        className="w-full h-full"
        containerClassName="flex flex-col flex-1"
      />
    </div>
  );
}
