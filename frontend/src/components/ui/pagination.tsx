"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showPageNumbers = false,
  className,
}: PaginationProps) => {
  const t = useTranslations("table");
  const tCalendar = useTranslations("calendar");

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t bg-white px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {t("showing")} {startItem} {t("to")} {endItem} {t("of")} {totalItems}{" "}
          {t("items")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label={tCalendar("previous")}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="sr-only">{tCalendar("previous")}</span>
        </Button>
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              {t("page")} {currentPage} {t("of")} {totalPages}
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label={tCalendar("next")}
        >
          <span className="sr-only">{tCalendar("next")}</span>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};
