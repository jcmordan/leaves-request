"use client";

import { useTranslations } from "next-intl";
import { FormTextArea } from "@/components/forms";
import { FormSection } from "./FormSection";

export const AdditionalNotesSection = () => {
  const t = useTranslations("requests");

  return (
    <FormSection title={t("additionalDetails")}>
      <FormTextArea
        name="reason"
        label={t("additionalComments")}
        placeholder={t("commentsPlaceholder")}
        rows={3}
        required
      />
    </FormSection>
  );
};
