"use client";

import { useTranslations } from "next-intl";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { Employee } from "./EmployeeTable";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import { IconChevronsUpRight, IconPencil } from "@tabler/icons-react";
import { formatNationalId, getInitials, truncate } from "@/utils/formatters";
import { usePathname } from "next/navigation";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";

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
    <span className="font-mono text-[0.85em] font-bold text-muted-foreground/60 px-2">
      {row.original.employeeCode}
    </span>
  );
};

const NationalIdCell = ({ row }: CellContext<Employee, any>) => {
  return (
    <span className="font-mono text-[0.85em] font-bold text-muted-foreground/60 px-2">
      {formatNationalId(row.original.nationalId)}
    </span>
  );
};

const EmployeeNameCell = ({ row }: CellContext<Employee, any>) => {
  const pathname = usePathname();
  const employee = row.original;
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-9 w-9 shrink-0 rounded-full ${getAvatarColor(employee.fullName ?? "")} flex items-center justify-center text-[0.8em] font-black ring-2 ring-white shadow-sm md:h-9 md:w-9 h-7 w-7`}
      >
        {getInitials(employee.fullName ?? "")}
      </div>
      <div className="flex flex-col min-w-0">
        <Link href={`${pathname}/${employee.id}`}>
          <span className="text-[1em] font-bold text-primary leading-tight group-hover:text-primary/80 transition-colors truncate">
            {employee.fullName}
          </span>
        </Link>
        <span className="text-[0.85em] font-medium text-muted-foreground/70 leading-tight truncate">
          {truncate(employee.jobTitle?.name, 40)}
        </span>
      </div>
    </div>
  );
};

const DepartmentCell = ({ row }: CellContext<Employee, any>) => {
  return (
    <span className="font-mono text-[0.85em] font-bold text-muted-foreground/60 px-2">
      {truncate(row.original.department?.name, 50)}
    </span>
  );
};

const ActionsCell = ({ row }: CellContext<Employee, any>) => {
  const pathname = usePathname();
  const { openSheet } = useSheets();

  const handleEdit = () => {
    openSheet(
      "EmployeeEditSheet",
      { employeeId: row.original.id },
      { width: "md" },
    );
  };

  return (
    <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity pr-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
        onClick={handleEdit}
      >
        <IconPencil className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
      >
        <Link href={`${pathname}/${row.original.id}`}>
          <IconChevronsUpRight className="h-8 w-8" />
        </Link>
      </Button>
    </div>
  );
};

export const useEmployeeColumns = () => {
  const c = useTranslations("common");

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
      cell: ActionsCell,
    },
  ];

  return columns;
};
