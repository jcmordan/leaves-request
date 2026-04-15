"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import FormSheet from "@/components/layout/sheets/FormSheet";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import {
  SUBMIT_LEAVE_REQUEST_MUTATION,
  MY_REQUESTS_QUERY,
  SUBMIT_LEAVE_REQUEST_QUERY,
} from "../graphql/MyRequestsQueries";
import {
  SubmitAbsentRequestForm,
  SubmitRequestValues,
  getSubmitRequestSchema,
} from "./SubmitAbsentRequestForm";
import { map } from "lodash";
import dayjs from "dayjs";

/**
 * Side sheet for submitting a new absence request.
 * Acts as a container for queries, mutations, and form orchestration.
 * Following the patterns from EmployeeEditSheet.tsx.
 */
export const SubmitAbsentRequestSheet = () => {
  const { closeSheet } = useSheets();
  const t = useTranslations("requests");

  const { data, loading: loadingTypes } = useQuery(SUBMIT_LEAVE_REQUEST_QUERY, {
    variables: { year: new Date().getFullYear() },
  });

  const holidays = map(data?.publicHolidays, (holiday) => holiday.date);

  const [submitRequest, { loading: submitting }] = useMutation(
    SUBMIT_LEAVE_REQUEST_MUTATION,
    {
      onCompleted: () => {
        toast.success(t("submitSuccess"));
        closeSheet();
      },
      onError: (error) => {
        toast.error(error.message || t("submitError"));
      },
      refetchQueries: [{ query: MY_REQUESTS_QUERY }],
    },
  );

  const defaultValues = useMemo<Partial<SubmitRequestValues>>(
    () => ({
      requestedDays: 1,
      startDate: new Date(),
    }),
    [],
  );

  const absenceTypes = data?.absenceTypes?.nodes || [];

  const resolver = useMemo(
    () => zodResolver(getSubmitRequestSchema(t, absenceTypes)),
    [t, absenceTypes],
  );

  const handleSubmit = async (values: SubmitRequestValues) => {
    const startDate = dayjs(values.startDate).startOf("date").toDate();
    const endDate = dayjs(values.endDate).startOf("date").toDate();

    await submitRequest({
      variables: {
        input: {
          employeeId: values.employeeId,
          absenceTypeId: values.absenceTypeId,
          absenceSubTypeId: values.absenceSubTypeId,
          startDate,
          endDate,
          reason: values.reason,
          diagnosis: values.diagnosis,
          treatingDoctor: values.treatingDoctor,
          file: values.file,
        },
      },
    });
  };

  return (
    <FormSheet
      title={t("submitNewRequest")}
      description={t("corporateManagement")}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      resolver={resolver}
      loading={loadingTypes}
      submitting={submitting}
      className="bg-white"
      showFooter={true}
    >
      <SubmitAbsentRequestForm
        absenceTypesRef={data?.absenceTypes}
        holidays={holidays}
      />
    </FormSheet>
  );
};

export default SubmitAbsentRequestSheet;
