"use client";

import * as z from "zod";
import { useAbsenceRequestLogic } from "./hooks/useAbsenceRequestLogic";
import { AbsenceCategorySection } from "./sections/AbsenceCategorySection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { MedicalContextSection } from "./sections/MedicalContextSection";
import { AdditionalNotesSection } from "./sections/AdditionalNotesSection";
import { FragmentType, useFragment } from "@/__generated__";
import { ABSENCE_TYPES_QUERY_FRAGMENT } from "../graphql/MyRequestsQueries";
import { useFormContext, useWatch } from "react-hook-form";

/**
 * Zod schema for absence request submission.
 * @param t - Translation function for i18n.
 * @param absenceTypes - List of available absence types with their rules.
 */
export const getSubmitRequestSchema = (
  t: (key: string) => string,
  absenceTypes: any[] = [],
) =>
  z
    .object({
      absenceTypeId: z.string().uuid(t("invalidAbsenceType")),
      absenceSubTypeId: z.string().uuid(t("invalidSubtype")).optional().nullable(),
      startDate: z.coerce.date({
        error: t("startDateRequired"),
      }),
      endDate: z.coerce.date({
        error: t("endDateRequired"),
      }),
      requestedDays: z.number().min(0.5, t("minDaysError")),
      diagnosis: z.string().optional().nullable(),
      treatingDoctor: z.string().optional().nullable(),
      file: z.any().optional().nullable(),
      reason: z.string().min(3, t("minReasonError")),
    })
    .superRefine((data, ctx) => {
      // Find the rule for the selected type (or subtype)
      const typeId = data.absenceSubTypeId || data.absenceTypeId;
      const rule = absenceTypes.find((node) => node.id === typeId);

      if (rule?.requiresDoctor) {
        if (!data.diagnosis || data.diagnosis.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("diagnosisRequired"),
            path: ["diagnosis"],
          });
        }
        if (!data.treatingDoctor || data.treatingDoctor.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("treatingDoctorRequired"),
            path: ["treatingDoctor"],
          });
        }
      }

      if (rule?.requiresAttachment && !data.file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("attachmentRequired"),
          path: ["file"],
        });
      }
    });

export type SubmitRequestValues = z.infer<
  ReturnType<typeof getSubmitRequestSchema>
>;

interface SubmitAbsentRequestFormProps {
  holidays: string[];
  absenceTypesRef?: FragmentType<typeof ABSENCE_TYPES_QUERY_FRAGMENT> | null;
}

/**
 * Form content for submitting an absence request.
 * Orchestrates modular sections and handles reactive logic.
 */
export const SubmitAbsentRequestForm = ({
  holidays,
  absenceTypesRef,
}: SubmitAbsentRequestFormProps) => {
  const {
    subTypes,
    isSickLeave,
    endDate,
    totalUnits,
    parentTypes,
    selectedType,
  } = useAbsenceRequestLogic(holidays, absenceTypesRef);

  return (
    <div className="space-y-8 pb-8">
      <AbsenceCategorySection absenceTypes={parentTypes} subTypes={subTypes} />

      <ScheduleSection
        endDate={endDate}
        totalUnits={totalUnits}
        selectedType={selectedType}
      />

      {isSickLeave && <MedicalContextSection />}

      <AdditionalNotesSection />
    </div>
  );
};
