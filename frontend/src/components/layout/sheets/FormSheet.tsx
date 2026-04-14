"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  FormProvider,
  useForm,
  type UseFormProps,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

import { LoadingSkeleton } from "@/components/card/LoadingCard";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FormSheetProps<TFieldValues extends FieldValues> = {
  title: string | React.ReactNode;
  description?: string;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  children: React.ReactNode;
  defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
  loading?: boolean;
  disabled?: boolean;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  allowSubmit?: boolean;
  secondaryAction?: React.ReactNode;
  footer?: React.ReactNode;
  showFooter?: boolean;
  className?: string;
  resolver?: Resolver<TFieldValues>;
};

export const FormSheet = <TFieldValues extends FieldValues>({
  title,
  onSubmit,
  children,
  defaultValues,
  mode = "onChange",
  submitting = false,
  loading = false,
  disabled = false,
  submitLabel,
  cancelLabel,
  description,
  allowSubmit = true,
  secondaryAction,
  footer,
  showFooter = true,
  className,
  resolver,
}: FormSheetProps<TFieldValues>) => {
  const { closeSheet, setOptions, sheetOptions } = useSheets();
  const t = useTranslations("common");
  const tLoading = useTranslations("loading");
  const formMethods = useForm<TFieldValues>({
    defaultValues,
    mode,
    resolver,
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      return;
    }

    if (defaultValues) {
      formMethods.reset(defaultValues);
    }
  }, [defaultValues, formMethods]);

  useEffect(() => {
    if (className && className !== sheetOptions?.className) {
      setOptions({ className });
    }
  }, [className, setOptions, sheetOptions?.className]);

  const handleSubmit = useCallback(
    async (values: TFieldValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const formSubmitHandler = useMemo(
    () => formMethods.handleSubmit(handleSubmit),
    [formMethods, handleSubmit],
  );

  const defaultSubmitLabel = useMemo(
    () => submitLabel ?? t("save"),
    [submitLabel, t],
  );

  const defaultCancelLabel = useMemo(
    () => cancelLabel ?? t("cancel"),
    [cancelLabel, t],
  );

  const loadingDescription = useMemo(() => tLoading("pleaseWait"), [tLoading]);

  const isLoadingOrSubmitting = useMemo(
    () => loading || submitting,
    [loading, submitting],
  );

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formSubmitHandler}
        className="flex flex-col flex-1 h-full min-h-0"
      >
        <SheetHeader className="bg-white">
          <SheetTitle>
            <span className="text-lg font-semibold pt-4">{title}</span>
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-auto p-8 pt-1 bg-white">
          {loading ? (
            <LoadingSkeleton description={loadingDescription} />
          ) : (
            <div className="flex flex-col gap-4">{children}</div>
          )}
        </div>
        {showFooter && (
          <div className="border-t border-outline-variant/10 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <SheetFooter className="flex flex-row justify-between items-center gap-2 pb-8 pt-8 px-8">
              {footer ?? (
                <>
                  <div>{secondaryAction}</div>
                  <div className="flex flex-row gap-2">
                    <Button
                      size="xl"
                      type="button"
                      variant="outline"
                      onClick={closeSheet}
                    >
                      {defaultCancelLabel}
                    </Button>
                    {allowSubmit && (
                      <Button
                        type="submit"
                        variant="default"
                        size="xl"
                        disabled={isLoadingOrSubmitting || disabled}
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        {defaultSubmitLabel}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </SheetFooter>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default FormSheet;
