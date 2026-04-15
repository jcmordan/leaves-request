"use client";

import { useTranslations } from "next-intl";
import { FormComboboxInput } from "@/components/forms";
import { FormSection } from "./FormSection";
import { AbsenceTypeOption } from "../hooks/useAbsenceRequestLogic";
import { useFormContext, useWatch } from "react-hook-form";
import { useEffect } from "react";

interface AbsenceCategorySectionProps {
  absenceTypes: AbsenceTypeOption[];
  subTypes: AbsenceTypeOption[];
}

export const AbsenceCategorySection = ({
  absenceTypes,
  subTypes,
}: AbsenceCategorySectionProps) => {
  const t = useTranslations("requests");
  const { setValue } = useFormContext();

  const absenceTypeId = useWatch({ name: "absenceTypeId" });
  useEffect(() => {
    setValue("absenceSubTypeId", null);
  }, [absenceTypeId]);

  return (
    <FormSection title={t("absenceCategory")}>
      <div className="grid grid-cols-2 gap-4">
        <FormComboboxInput
          name="absenceTypeId"
          label={t("absenceType")}
          options={absenceTypes}
          enableLocalFilter
          required
        />
        <FormComboboxInput
          name="absenceSubTypeId"
          label={t("absenceSubtype")}
          options={subTypes}
          enableLocalFilter
          disabled={!absenceTypeId || subTypes.length === 0}
        />
      </div>
    </FormSection>
  );
};
