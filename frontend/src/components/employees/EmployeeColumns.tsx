'use client'

import { useTranslations } from "next-intl";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { Employee } from "./EmployeeTable";
import { Button } from "../ui/button";
import Link from "next/link";
import { IconChevronsUpRight } from "@tabler/icons-react";
import { formatCedula } from "@/utils/formatters";

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-rose-100 text-rose-600",
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-slate-100 text-slate-600",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const EmployeeCodeCell = ({ row }: CellContext<Employee, any>) => {
  return (
    <span className="font-mono text-[11px] font-bold text-muted-foreground/60 px-2">
      {row.original.employeeCode}
    </span>
  );
};

const NationalIdCell = ({ row }: CellContext<Employee, any>) => {
  return (
    <span className="font-mono text-[11px] font-bold text-muted-foreground/60 px-2">
      {formatCedula(row.original.nationalId)}
    </span>
  );
};

const EmployeeNameCell = ({ row }: CellContext<Employee, any>) => {
    const tRoles = useTranslations("Roles");
    const employee = row.original;
    return (
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-full ${getAvatarColor(employee.fullName ?? "")} flex items-center justify-center text-xs font-black ring-2 ring-white shadow-sm`}
        >
          {employee.fullName?.charAt(0)}
        </div>
        <div className="flex flex-col">
          <Link href={`/employees/${employee.id}`}>
            <span className="text-sm font-bold text-primary leading-tight group-hover:text-primary/80 transition-colors">
              {employee.fullName}
            </span>
          </Link>
          <span className="text-[11px] font-medium text-muted-foreground/70 leading-tight">
            {employee.jobTitle?.name ?? "-"}
          </span>
        </div>
      </div>
    );
}

const DepartmentCell = ({ row }: CellContext<Employee, any>) => {
  return (
    <span className="font-mono text-[11px] font-bold text-muted-foreground/60 px-2">
      {row.original.department?.name ?? "-"}
    </span>
  );
}
  

export const useEmployeeColumns = () => {
    const c = useTranslations("Common");
    const tRoles = useTranslations("Roles");

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "firstName",
      header: c("employee"),
      cell: EmployeeNameCell,
    },
    {
      accessorKey: "employeeCode",
      header: c("employeeCode"),
      cell: EmployeeCodeCell,
    },
    {
      accessorKey: "nationalId",
      header: c("nationalId"),
      cell: NationalIdCell,
    },

    {
      accessorKey: "department.name",
      header: c("department"),
      cell: DepartmentCell,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
          >
            <Link href={`/employees/${row.original.id}`}>
              <IconChevronsUpRight className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};
