"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

import { LoadingSkeleton } from "@/components/card/LoadingCard";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type DetailSheetProps = {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  closeLabel?: string;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
};

export const DetailSheet = ({
  title,
  description,
  children,
  loading = false,
  closeLabel,
  actions,
  headerActions,
  secondaryAction,
  className,
}: DetailSheetProps) => {
  const { closeSheet, setOptions, sheetOptions } = useSheets();
  const t = useTranslations("common");
  const tLoading = useTranslations("loading");

  useEffect(() => {
    if (className && !sheetOptions?.width) {
      setOptions({ width: className });
    }
  }, [className, setOptions, sheetOptions?.width]);

  const defaultCloseLabel = useMemo(
    () => closeLabel ?? t("close"),
    [closeLabel, t],
  );
  const loadingDescription = useMemo(() => tLoading("pleaseWait"), [tLoading]);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="flex flex-col gap-2 p-8 pr-12 pb-0">
        <div className="flex flex-row justify-between items-center w-full">
          {typeof title === "string" ? (
            <SheetTitle className="text-xl">{title}</SheetTitle>
          ) : (
            <SheetTitle className="text-xl" asChild>
              {title}
            </SheetTitle>
          )}
          {headerActions && (
            <div className="flex flex-row gap-2 shrink-0">{headerActions}</div>
          )}
        </div>
        {description &&
          (typeof description === "string" ? (
            <SheetDescription className="text-sm leading-relaxed">
              {description}
            </SheetDescription>
          ) : (
            <SheetDescription className="text-sm leading-relaxed" asChild>
              {description}
            </SheetDescription>
          ))}
      </SheetHeader>
      <div className="flex-1 overflow-auto p-8 pt-1">
        {loading ? (
          <LoadingSkeleton description={loadingDescription} />
        ) : (
          <div className="flex flex-col gap-4">{children}</div>
        )}
      </div>
      <SheetFooter className="flex flex-row justify-between items-center gap-2">
        <div>{secondaryAction}</div>
        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeSheet}
            className="h-auto font-bold"
          >
            {defaultCloseLabel}
          </Button>
          {actions}
        </div>
      </SheetFooter>
    </div>
  );
};

export default DetailSheet;
