"use client";

import { useTranslations } from "next-intl";
import { type JSX, useEffect, useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ColumnDef<T = any> = {
  id?: string;
  title: string;
  field: keyof T | string;
  align?: "left" | "right" | "center";
  render?: (item: T) => string | JSX.Element | null | undefined;
  width?: number | string;
};

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    initialPage?: number;
  };
};

export const SimpleTable = <T extends { id: string; [key: string]: any }>({
  columns,
  data,
  pagination,
}: Props<T>) => {
  const t = useTranslations("table");

  const pageSize = pagination?.pageSize ?? 10;
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage ?? 1);

  const totalPages = pagination?.enabled
    ? Math.ceil(data.length / pageSize)
    : 1;

  useEffect(() => {
    if (pagination?.enabled && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, pagination?.enabled, currentPage, totalPages]);

  const paginatedData = pagination?.enabled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map(({ id, field, align, title, width }, columnIndex) => (
              <TableHead
                key={`${id ?? field.toString()}-${columnIndex}`}
                className={
                  align === "right"
                    ? "text-right"
                    : align === "center"
                      ? "text-center"
                      : "text-left"
                }
                style={{ width }}
              >
                {title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length ? (
            paginatedData.map((row) => (
              <TableRow key={row.id}>
                {columns.map(({ id, field, align, render }, columnIndex) => {
                  return (
                    <TableCell
                      key={`${id ?? field.toString()}-${columnIndex}`}
                      className={
                        align === "right"
                          ? "text-right"
                          : align === "center"
                            ? "text-center"
                            : "text-left"
                      }
                    >
                      {render
                        ? render(row)
                        : String(row[field.toString()] ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("noResults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination?.enabled && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
