"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Calendar, TriangleAlert, XCircle } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FragmentType, useFragment } from "@/__generated__";
import {
  MY_REQUEST_ITEM_FRAGMENT,
  CANCEL_REQUEST_MUTATION,
} from "../graphql/MyRequestsQueries";

interface CancelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestRef: FragmentType<typeof MY_REQUEST_ITEM_FRAGMENT> | null;
  onSuccess?: () => void;
}

/**
 * CancelRequestModal Component
 * A high-fidelity confirmation modal for cancelling a leave request.
 * Aligned with the Stitch design system.
 */
export function CancelRequestModal({
  isOpen,
  onClose,
  requestRef,
  onSuccess,
}: CancelRequestModalProps) {
  const t = useTranslations("requests");
  const { locale } = useParams();
  const dateLocale = locale === "es" ? es : enUS;

  const request = useFragment(MY_REQUEST_ITEM_FRAGMENT, requestRef);

  const [cancelRequest, { loading }] = useMutation(CANCEL_REQUEST_MUTATION, {
    onCompleted: (data) => {
      if (data.cancelLeaveRequest) {
        toast.success(t("cancelSuccess"));
        onSuccess?.();
        onClose();
      } else {
        toast.error(t("cancelError"));
      }
    },
    onError: () => {
      toast.error(t("cancelError"));
    },
  });

  if (!request) {
    return null;
  }

  const handleCancel = () => {
    cancelRequest({
      variables: {
        input: {
          requestId: request.id,
          reason: "Cancelled by employee",
        },
      },
    });
  };

  const startDateStr = format(new Date(request.startDate), "MMM d", {
    locale: dateLocale,
  });
  const endDateStr = format(new Date(request.endDate), "MMM d, yyyy", {
    locale: dateLocale,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-surface-container-lowest shadow-2xl rounded-xl">
        {/* Header section with Icon */}
        <div className="px-8 pt-8 pb-4">
          <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mb-6">
            <XCircle className="text-error w-8 h-8" />
          </div>
          <DialogHeader className="text-left p-0">
            <DialogTitle className="text-2xl font-headline font-extrabold text-primary tracking-tight mb-2">
              {t("cancelRequestTitle")}
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant leading-relaxed text-base font-medium">
              {t("cancelRequestConfirmation")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Request Details Box */}
        <div className="px-8 pb-8">
          <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 border border-outline-variant/15">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Calendar className="text-primary w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant/50 leading-none mb-1">
                {t("requestSummary")}
              </span>
              <span className="text-sm font-bold text-primary">
                {request.absenceType?.name}: {startDateStr} - {endDateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <Button
            variant="destructive"
            className="w-full py-6 rounded-xl font-headline font-bold text-sm shadow-lg shadow-error/20 h-auto flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            onClick={handleCancel}
            disabled={loading}
          >
            <TriangleAlert className="w-5 h-5" />
            {loading ? t("cancelling") : t("confirmCancel")}
          </Button>
          <Button
            variant="ghost"
            className="w-full py-6 rounded-xl font-headline font-bold text-sm text-primary hover:bg-surface-container border border-outline-variant/30 h-auto transition-all active:scale-[0.98]"
            onClick={onClose}
            disabled={loading}
          >
            {t("keepRequest")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
