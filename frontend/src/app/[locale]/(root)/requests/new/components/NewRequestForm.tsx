"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation, useSuspenseQuery } from "@apollo/client/react";
import { graphql } from "@/__generated__";
import { ABSENCE_TYPES_QUERY } from "../graphql/NewRequestQueries";

const CreateRequestMutation = graphql(`
  mutation CreateRequest($input: SubmitLeaveRequestInput!) {
    submitLeaveRequest(input: $input) {
      id
      status
    }
  }
`);

const formSchema = z
  .object({
    absenceTypeId: z.string().min(1, "Please select an absence type"),
    startDate: z.date({ message: "Start Date is required" }),
    endDate: z.date({ message: "End Date is required" }),
    reason: z.string().min(10, "Reason must be at least 10 characters."),
    // Conditional fields
    hospitalName: z.string().optional(),
    doctorName: z.string().optional(),
  })
  .refine(
    (data) => {
      // Logic for medical info if needed
      return true;
    },
    {
      message:
        "Hospital and Doctor fields are required for this sickness category.",
      path: ["hospitalName"],
    },
  );

/**
 * New Request Form Component.
 * Consumes preloaded absence types.
 */
export default function NewRequestForm() {
  const router = useRouter();
  const t = useTranslations("Requests");
  const [createRequest] = useMutation(CreateRequestMutation);

  const { data } = useSuspenseQuery(ABSENCE_TYPES_QUERY as any);
  const absenceTypes = (data as any)?.absenceTypes || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const watchAbsenceTypeId = form.watch("absenceTypeId");
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAbsenceType = absenceTypes.find(
    (t: any) => t.id === watchAbsenceTypeId,
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createRequest({
        variables: {
          input: {
            absenceTypeId: values.absenceTypeId,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
            reason: values.reason,
            // Add other fields if backend input type supports them
          },
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (!watchStartDate || !watchEndDate) return null;
    const diffTime = Math.abs(
      watchEndDate.getTime() - watchStartDate.getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card className="shadow-premium border-outline-variant/10">
        <CardHeader>
          <CardTitle className="text-2xl font-heading font-bold bg-linear-to-r from-primary to-primary-container bg-clip-text text-transparent">
            {t("newRequestTitle")}
          </CardTitle>
          <CardDescription>{t("newRequestDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="leave-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="absenceTypeId">{t("absenceTypeLabel")} *</Label>
                <Select
                  onValueChange={(val) => {
                    form.setValue("absenceTypeId", val);
                  }}
                >
                  <SelectTrigger id="absenceTypeId">
                    <SelectValue placeholder={t("selectTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {absenceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.absenceTypeId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.absenceTypeId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("startDateLabel")} *</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchStartDate && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchStartDate ? (
                        format(watchStartDate, "PPP")
                      ) : (
                        <span>{t("pickDatePlaceholder")}</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchStartDate}
                        onSelect={(date) =>
                          form.setValue("startDate", date as Date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("endDateLabel")} *</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchEndDate && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchEndDate ? (
                        format(watchEndDate, "PPP")
                      ) : (
                        <span>{t("pickDatePlaceholder")}</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchEndDate}
                        onSelect={(date) =>
                          form.setValue("endDate", date as Date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {duration && duration > 0 && (
                <div className="p-3 bg-secondary/5 rounded-lg text-sm border border-secondary/10 flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-secondary" />
                  <span>
                    <strong>{t("estimatedDuration")}:</strong> {duration}{" "}
                    {t("workingDays")}
                  </span>
                </div>
              )}

              {selectedAbsenceType?.requiresHospitalInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-primary/20 bg-primary/5 rounded-md">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-primary mb-2">
                      {t("medicalAffidavitTitle")}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">
                      {t("hospitalNameLabel")} *
                    </Label>
                    <Input
                      id="hospitalName"
                      onChange={(e) =>
                        form.setValue("hospitalName", e.target.value)
                      }
                    />
                    {form.formState.errors.hospitalName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.hospitalName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">{t("doctorNameLabel")} *</Label>
                    <Input
                      id="doctorName"
                      onChange={(e) =>
                        form.setValue("doctorName", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">{t("reasonLabel")} *</Label>
                <Textarea
                  id="reason"
                  placeholder={t("reasonPlaceholder")}
                  className="min-h-[100px] border-outline-variant/20 focus:border-primary"
                  onChange={(e) => form.setValue("reason", e.target.value)}
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.reason.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-outline-variant/10 p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-rose-50 hover:text-rose-600"
          >
            {t("cancelButton")}
          </Button>
          <Button
            type="submit"
            form="leave-form"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 shadow-md"
          >
            {isSubmitting ? t("submittingText") : t("submitButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
