"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { graphql } from "@/gql";
import { useMutation } from "@apollo/client/react";

const CreateRequestMutation = graphql(`
  mutation CreateRequest($input: CreateRequestInput!) {
    createRequest(input: $input) {
      id
      status
    }
  }
`);

// Static mock categories based on Requirements
const LEAVE_CATEGORIES = {
  Vacation: ["Annual Leave"],
  Sickness: [
    "Sickness > 3 Days (Affidavit from hospital required)",
    "Sickness < 3 Days",
    "On the job accident"
  ],
  Presenteeism: [
    "Wedding",
    "Paternity Leave",
    "Death of Family Member",
    "Personal Affairs (deducted from Vacation)"
  ]
};

const formSchema = z.object({
  absenceType: z.enum(["Vacation", "Sickness", "Presenteeism"]),
  category: z.string().min(1, "Please select a subcategory"),
  startDate: z.date({ message: "Start Date is required" }),
  endDate: z.date({ message: "End Date is required" }),
  reason: z.string().min(10, "Reason must be at least 10 characters."),
  // Conditional fields
  hospitalName: z.string().optional(),
  doctorName: z.string().optional(),
}).refine(data => {
  if (data.absenceType === "Sickness" && data.category.includes("> 3 Days")) {
    return !!data.hospitalName && !!data.doctorName;
  }
  return true;
}, {
  message: "Hospital and Doctor fields are required for this sickness category.",
  path: ["hospitalName"]
});

export default function NewRequestPage() {
  const router = useRouter();
  const [createRequest] = useMutation(CreateRequestMutation);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const watchAbsenceType = form.watch("absenceType");
  const watchCategory = form.watch("category");
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // In reality, this would be a GraphQL mutation
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createRequest({
        variables: {
          input: {
            absenceType: values.absenceType,
            category: values.category,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
            reason: values.reason,
            hospitalName: values.hospitalName,
            doctorName: values.doctorName
          }
        }
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic working days duration mock calculation
  const calculateDuration = () => {
    if (!watchStartDate || !watchEndDate) return null;
    const diffTime = Math.abs(watchEndDate.getTime() - watchStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    // Real calculation would exclude weekends and holidays here
    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Leave Request</CardTitle>
          <CardDescription>
            Fill out the details below to request time off. Your supervisor will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="leave-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="absenceType">Absence Type *</Label>
                <Select onValueChange={(val) => {
                  form.setValue("absenceType", val as "Vacation" | "Sickness" | "Presenteeism");
                  form.setValue("category", ""); // reset subcategory
                }}>
                  <SelectTrigger id="absenceType">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Sickness">Sickness</SelectItem>
                    <SelectItem value="Presenteeism">Presenteeism</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.absenceType && (
                  <p className="text-sm text-destructive">{form.formState.errors.absenceType.message}</p>
                )}
              </div>

              {watchAbsenceType && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={watchCategory} 
                    onValueChange={(val) => form.setValue("category", val ?? "")}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {watchAbsenceType && LEAVE_CATEGORIES[watchAbsenceType as keyof typeof LEAVE_CATEGORIES]?.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchStartDate && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchStartDate ? format(watchStartDate, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchStartDate}
                        onSelect={(date) => form.setValue("startDate", date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchEndDate && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchEndDate ? format(watchEndDate, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchEndDate}
                        onSelect={(date) => form.setValue("endDate", date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {duration && duration > 0 && (
                <div className="p-3 bg-muted rounded-md text-sm border">
                  <strong>Estimated Duration:</strong> {duration} working day(s)
                </div>
              )}

              {watchAbsenceType === "Sickness" && watchCategory?.includes("> 3 Days") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-primary/20 bg-primary/5 rounded-md">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-primary mb-2">Medical Affidavit Information</h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name *</Label>
                    <Input 
                      id="hospitalName" 
                      onChange={(e) => form.setValue("hospitalName", e.target.value)} 
                    />
                    {form.formState.errors.hospitalName && (
                      <p className="text-sm text-destructive">{form.formState.errors.hospitalName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Doctor Name *</Label>
                    <Input 
                      id="doctorName" 
                      onChange={(e) => form.setValue("doctorName", e.target.value)} 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Detailed Reason *</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Provide context for your supervisor..."
                  className="min-h-[100px]"
                  onChange={(e) => form.setValue("reason", e.target.value)}
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
                )}
              </div>

            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" form="leave-form" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
