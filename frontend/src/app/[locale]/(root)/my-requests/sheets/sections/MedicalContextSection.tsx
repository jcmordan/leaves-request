"use client";

import { useTranslations } from "next-intl";
import { IconStethoscope } from "@tabler/icons-react";
import { FormTextInput, FormFileInput } from "@/components/forms";
import { FormSection } from "./FormSection";

export const MedicalContextSection = () => {
  const t = useTranslations("requests");

  return (
    <FormSection title={t("medicalLeaveDetails")}>
      <div className="p-6 rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-2 mb-2">
          <IconStethoscope className="text-primary" size={18} stroke={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            {t("medicalEvidence")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormTextInput
            name="diagnosis"
            label={t("diagnosis")}
            placeholder={t("diagnosis")}
          />
          <FormTextInput
            name="treatingDoctor"
            label={t("treatingDoctor")}
            placeholder={t("treatingDoctor")}
          />
        </div>

        <FormFileInput
          name="file"
          label={t("medicalCertificate")}
          text={t("uploadEvidence")}
          maxSize={t("maxFileSize")}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>
    </FormSection>
  );
};
