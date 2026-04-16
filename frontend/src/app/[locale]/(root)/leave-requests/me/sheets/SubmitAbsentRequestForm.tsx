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
import EmployeeSelector from "./sections/EmployeeSelector";
import { FormSwitch } from "@/components/forms";
import { useTranslations } from "next-intl";

/**
 * Zod schema for absence request submission.
 * @param t - Translation function for i18n.
 * @param absenceTypes - List of available absence types with their rules.
 */
export const getSubmitRequestSchema = (
  t: (key: string, ...args: any[]) => string,
  absenceTypes: any[] = [],
) =>
  z
    .object({
      requestForSomeoneElse: z.boolean().default(false),
      employeeId: z.uuid(t("invalidEmployee")).optional().nullable(),
      absenceTypeId: z.uuid(t("invalidAbsenceType")),
      absenceSubTypeId: z.uuid(t("invalidSubtype")).optional().nullable(),
      startDate: z.coerce.date({
        error: () => ({ message: t("startDateRequired") }),
      }),
      endDate: z.coerce.date({
        error: () => ({ message: t("endDateRequired") }),
      }),
      requestedDays: z.coerce
        .number()
        .min(1, t("minDaysError"))
        .max(31, t("maxDaysError", { maxDays: 31 })),
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

  const t = useTranslations("requests");
  const forSomeoneElse = useWatch({ name: "requestForSomeoneElse" });
  const values = useWatch();


  return (
    <div className="space-y-8 pb-8 pt-8">
      <div className="col-span-1 mt-2">
        <div className="rounded-lg">
          <FormSwitch
            name="requestForSomeoneElse"
            labelPosition="top"
            label={t("requestForSomeoneElse")}
          />
        </div>
      </div>

      {forSomeoneElse && <EmployeeSelector />}
      <AbsenceCategorySection absenceTypes={parentTypes} subTypes={subTypes} />

      <ScheduleSection
        endDate={endDate}
        totalUnits={totalUnits}
        selectedType={selectedType}
      />

      {isSickLeave && <MedicalContextSection />}

      <AdditionalNotesSection />
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
};
