"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { RequestStatus, MyRequests_ItemFieldsFragment } from "@/__generated__/graphql";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { IconCancel, IconChevronsUpRight } from "@tabler/icons-react";
import { daysBetween } from "@/utils/dateUtils";

export type RequestItem = MyRequests_ItemFieldsFragment;

const StatusCell = ({ row }: CellContext<RequestItem, any>) => {
  const t = useTranslations("requests");
  const status = row.original.status;

  switch (status) {
    case RequestStatus.Approved:
      return (
        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase rounded-full tracking-tighter">
          {t("approved")}
        </span>
      );
    case RequestStatus.Pending:
    case RequestStatus.PendingCoordinatorApproval:
    case RequestStatus.ModificationRequested:
      return (
        <span className="px-3 py-1 bg-surface-container-high text-surface-tint text-[10px] font-black uppercase rounded-full tracking-tighter">
          {t("pending")}
        </span>
      );
    case RequestStatus.Rejected:
      return (
        <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-black uppercase rounded-full tracking-tighter">
          {t("rejected")}
        </span>
      );
    case RequestStatus.Cancelled:
      return (
        <span className="px-3 py-1 bg-surface-container-low text-outline text-[10px] font-black uppercase rounded-full tracking-tighter">
          {t("cancelled")}
        </span>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const SubmittedCell = ({ row }: CellContext<RequestItem, any>) => {
  return (
    <span className="text-xs font-medium text-primary font-body">
      {format(new Date(row.original.createdAt), "MMM d, yyyy")}
    </span>
  );
};

const TypeCell = ({ row }: CellContext<RequestItem, any>) => {
  return (
    <span className="px-3 py-1 bg-tertiary-fixed/30 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider font-heading">
      {row.original.absenceType?.name || "Other"}
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
    <div className="flex flex-col">
      <p className="text-sm text-primary font-bold font-heading">
        {daysBetween(request.startDate, request.endDate)}
      </p>
    </div>
  );
};

const ActionsCell = ({
  row,
  onCancel,
}: CellContext<RequestItem, any> & {
  onCancel?: (request: RequestItem) => void;
}) => {
  const t = useTranslations("requests");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const request = row.original;

  const handleViewDetails = () => {
    router.push(`/${locale}/leave-requests/${request.id}`);
  };

  return (
    <div className="flex gap-2 justify-end">
      {request.status === RequestStatus.Pending && (
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

export const useRequestColumns = (onCancel?: (request: RequestItem) => void) => {
  const t = useTranslations("requests");

  const columns: ColumnDef<RequestItem>[] = [
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
      header: t("days"),
      cell: DaysCell,
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: StatusCell,
    },
    {
      id: "actions",
      header: "",
      cell: (props) => <ActionsCell {...props} onCancel={onCancel} />,
    },
  ];

  return columns;
};
