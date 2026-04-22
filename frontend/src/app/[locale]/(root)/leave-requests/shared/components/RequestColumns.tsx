"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { RequestStatus, RequestList_ItemFieldsFragment } from "@/__generated__/graphql";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

import { IconCancel, IconChevronsUpRight } from "@tabler/icons-react";
import { daysBetween } from "@/utils/dateUtils";
import { RequestStatusBadge } from "./RequestStatusBadge";

export type RequestItem = RequestList_ItemFieldsFragment;

const StatusCell = ({ row }: CellContext<RequestItem, any>) => {
  const status = row.original.status;

  return (
    <div className="flex justify-center w-full">
      <RequestStatusBadge
        status={status}
        showDot={false}
        className="text-[10px] font-black uppercase tracking-tighter px-3 py-1"
      />
    </div>
  );
};

const SubmittedCell = ({ row }: CellContext<RequestItem, any>) => {
  return (
    <span className="text-xs font-medium text-primary font-body">
      {format(new Date(row.original.createdAt), "MMM d, yyyy")}
    </span>
  );
};

const TypeCell = ({ row }: CellContext<RequestItem, any>) => {
  const { absenceType, absenceSubType } = row.original;
  return (
    <span className="px-3 py-1 bg-tertiary-fixed/30 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider font-heading">
      {`${absenceType?.name || "Other"} ${absenceSubType?.name ? `(${absenceSubType.name})` : ""}`}
    </span>
  );
};

const EmployeeCell = ({ row }: CellContext<RequestItem, any>) => {
  return (
    <span className="px-3 py-1 bg-tertiary-fixed/30 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider font-heading">
      {row.original.employee?.fullName}
    </span>
  );
};

const PeriodCell = ({ row }: CellContext<RequestItem, any>) => {
  const request = row.original;
  return (
    <div className="flex flex-col">
      <p className="text-sm text-primary font-bold font-heading">
        {format(new Date(request.startDate), "MMM d")} -{" "}
        {format(new Date(request.endDate), "MMM d")}
      </p>
    </div>
  );
};

const DaysCell = ({ row }: CellContext<RequestItem, any>) => {
  const request = row.original;
  return (
    <div className="flex justify-center w-full">
      <p className="text-sm text-primary font-bold font-heading">
        {daysBetween(request.startDate, request.endDate)}
      </p>
    </div>
  );
};

const ActionsCell = ({
  row,
  onCancel,
  basePath = "me",
}: CellContext<RequestItem, any> & {
  onCancel?: (request: RequestItem) => void;
  basePath?: "me" | "approvals" | "all";
}) => {
  const t = useTranslations("requests");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const request = row.original;

  const handleViewDetails = () => {
    router.push(`/${locale}/leave-requests/${basePath}/${request.id}`);
  };

  return (
    <div className="flex gap-2 justify-end">
      {basePath === "me" && request.status === RequestStatus.Pending && (
        <Button
          variant="ghost"
          className="h-8 w-8 hover:bg-white transition-colors"
          onClick={() => onCancel?.(request)}
        >
          <IconCancel />
        </Button>
      )}
      <Button
        variant="ghost"
        className="h-8 w-8 hover:bg-white transition-colors"
        onClick={handleViewDetails}
        title={t("viewDetails")}
      >
        <IconChevronsUpRight />
      </Button>
    </div>
  );
};

export const useRequestColumns = (
  onCancel?: (request: RequestItem) => void,
  basePath: "me" | "approvals" | "all" = "me",
) => {
  const t = useTranslations("requests");

  const columns: (ColumnDef<RequestItem> & { align?: "left" | "right" | "center" })[] = [
    {
      accessorKey: "createdAt",
      header: t("submitted"),
      cell: SubmittedCell,
    },
    {
      accessorKey: "employee.fullName",
      header: t("requestedFor"),
      cell: EmployeeCell,
    },
    {
      accessorKey: "absenceType.name",
      header: t("type"),
      cell: TypeCell,
    },
    {
      id: "period",
      header: t("period"),
      cell: PeriodCell,
    },
    {
      id: "days",
      header: () => (
        <div className="text-center w-full">{t("days")}</div>
      ),
      cell: DaysCell,
      align: "center",
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center w-full">{t("status")}</div>
      ),
      cell: StatusCell,
      align: "center",
    },
    {
      id: "actions",
      header: "",
      cell: (props) => (
        <ActionsCell {...props} onCancel={onCancel} basePath={basePath} />
      ),
    },
  ];

  return columns;
};
