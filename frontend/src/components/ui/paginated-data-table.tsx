"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PageInfo {
  hasNextPage?: boolean | null;
  hasPreviousPage?: boolean | null;
  startCursor?: string | null;
  endCursor?: string | null;
}

interface PaginatedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | null | undefined;
  pageInfo?: PageInfo | null;
  loading?: boolean;
  emptyMessage?: string;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  className?: string;
  containerClassName?: string;
  density?: "comfortable" | "standard" | "compact";
}

export function PaginatedDataTable<TData, TValue>({
  columns,
  data,
  pageInfo,
  loading = false,
  emptyMessage,
  onNextPage,
  onPreviousPage,
  className,
  containerClassName,
  density = "standard",
}: Readonly<PaginatedDataTableProps<TData, TValue>>) {
  const pagination = useUrlPagination(pageInfo);

  const handleNext = onNextPage ?? pagination.handleNextPage;
  const handlePrevious = onPreviousPage ?? pagination.handlePreviousPage;

  return (
    <div className={containerClassName ?? "flex flex-col gap-4"}>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage={emptyMessage}
        className={className}
        density={density}
      />

      {pageInfo && (
        <div className="flex justify-end gap-2 px-4 py-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!pageInfo.hasPreviousPage || loading}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!pageInfo.hasNextPage || loading}
          >
            <IconChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
