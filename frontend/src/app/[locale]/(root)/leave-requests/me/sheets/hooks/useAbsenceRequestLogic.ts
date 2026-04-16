"use client";

import { useWatch, useFormContext } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { calculateEndDate } from "../../utils/BusinessDaysUtils";
import { FragmentType, useFragment } from "@/__generated__";
import { ABSENCE_TYPES_QUERY_FRAGMENT } from "../../graphql/MyRequestsQueries";
import filter from "lodash/filter";
import { AbsenceType, CalculationType } from "@/__generated__/graphql";

export type AbsenceTypeOption = {
  label: string;
  value: string;
};

type AbsenceRequestData = {
  selectedType?: Partial<AbsenceType> | null;
  parentTypes: AbsenceTypeOption[];
  subTypes: AbsenceTypeOption[];
  isSickLeave: boolean;
  endDate: Date | null;
  totalUnits: number;
  deductsFromBalance: boolean;
  calculationType: CalculationType;
};

/**
 * Custom hook to handle business logic for absence requests.
 *
 * @param holidays - List of public holidays.
 * @param absenceTypes - List of available absence types.
 */
export const useAbsenceRequestLogic = (
  holidays: string[],
  absenceTypesRef?: FragmentType<typeof ABSENCE_TYPES_QUERY_FRAGMENT> | null,
): AbsenceRequestData => {
  const { control, setValue } = useFormContext();

  const absenceTypesData = useFragment(
    ABSENCE_TYPES_QUERY_FRAGMENT,
    absenceTypesRef,
  );

  const absenceTypes = absenceTypesData?.nodes || [];

  const parentTypes = filter(absenceTypes, (node) => node.parentId === null);

  const watchTypeId = useWatch({ control, name: "absenceTypeId" });
  const watchSubTypeId = useWatch({ control, name: "absenceSubTypeId" });
  const watchStartDate = useWatch({ control, name: "startDate" });
  const watchRequestedDays = useWatch({ control, name: "requestedDays" });

  const selectedType = useMemo(
    () => parentTypes.find((t: any) => t.id === watchTypeId),
    [watchTypeId, parentTypes],
  );

  const selectedSubType = useMemo(
    () => absenceTypes.find((t: any) => t.id === watchSubTypeId),
    [watchSubTypeId, absenceTypes],
  );

  const subTypes = useMemo(
    () => absenceTypes.filter((t: any) => t.parentId === selectedType?.id),
    [selectedType],
  );

  const isSickLeave = useMemo(
    () =>
      selectedSubType?.requiresDoctor ?? selectedType?.requiresDoctor ?? false,
    [selectedType, selectedSubType],
  );

  const reqeustType = selectedSubType ?? selectedType;

  const endDate = useMemo(() => {
    if (!watchStartDate || !watchRequestedDays) return null;

    return calculateEndDate(
      watchStartDate,
      watchRequestedDays,
      reqeustType?.calculationType === CalculationType.WorkingDays
        ? holidays
        : [],
      reqeustType?.calculationType,
    );
  }, [watchStartDate, watchRequestedDays, holidays, reqeustType?.calculationType]);

  useEffect(() => {
    if (endDate) {
      setValue("endDate", endDate);
    }
  }, [endDate, setValue]);

  return {
    selectedType: reqeustType,
    parentTypes: parentTypes.map((t: any) => ({ label: t.name, value: t.id })),
    subTypes: subTypes.map((t: any) => ({ label: t.name, value: t.id })),
    deductsFromBalance: reqeustType?.deductsFromBalance ?? false,
    calculationType:
      reqeustType?.calculationType ?? CalculationType.CalendarDays,
    isSickLeave,
    endDate,
    totalUnits: watchRequestedDays || reqeustType?.maxDaysPerYear,
  };
};
