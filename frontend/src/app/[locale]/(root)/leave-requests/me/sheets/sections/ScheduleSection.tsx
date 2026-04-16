"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { FormDateInput, FormTextInput } from "@/components/forms";
import { FormSection } from "./FormSection";
import { FormNumberInput } from "@/components/forms/form-input/FormNumberInput";
import { useFormContext, useWatch } from "react-hook-form";
import { AbsenceType } from "@/__generated__/graphql";
import { useEffect } from "react";

interface ScheduleSectionProps {
  endDate: Date | null;
  totalUnits: number;
  selectedType?: Partial<AbsenceType> | null;
}

export const ScheduleSection = ({
  endDate,
  totalUnits,
  selectedType,
}: ScheduleSectionProps) => {
  const t = useTranslations("requests");
  const { register, setValue } = useFormContext();

  useEffect(() => {
    const defaultDayes = selectedType?.maxDaysPerYear ?? 0;

    setValue("requestedDays", defaultDayes > 0 ? defaultDayes : 1);
  }, [selectedType]);

  return (
    <FormSection title={t("schedule")}>
      <div className="space-y-4">
        <input type="hidden" {...register("endDate")} />
        <div className="grid grid-cols-2 gap-4">
          <FormDateInput name="startDate" label={t("startDate")} required />
          <FormNumberInput
            name="requestedDays"
            label={t("requestedDays")}
            step="1"
            max={selectedType?.maxDaysPerYear}
            disabled={!!selectedType?.maxDaysPerYear}
            required
          />
        </div>

        {/* Calculation Summary Panel */}
        <div className="bg-surface-container-high/50 border border-outline-variant/10 p-4 rounded-xl flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              {t("calculatedEndDate")}
            </span>
            <span className="text-sm font-bold text-primary">
              {endDate ? format(endDate, "MMMM d, yyyy") : "---"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 block">
              {t("totalUnits")}
            </span>
            <span className="text-lg font-black text-secondary">
              {totalUnits} {totalUnits === 1 ? t("day") : t("days")}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
