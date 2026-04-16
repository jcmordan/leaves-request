"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CheckCircle, XCircle, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  APPROVE_REQUEST_MUTATION,
  REJECT_REQUEST_MUTATION,
} from "../graphql/ApprovalQueries";

interface ApprovalActionCardProps {
  requestId: string;
  status: string;
}

/**
 * ApprovalActionCard — Comment textarea with Approve / Reject action buttons.
 * Disabled when the request is no longer in PENDING status.
 */
export function ApprovalActionCard({
  requestId,
  status,
}: ApprovalActionCardProps) {
  const t = useTranslations("requests");
  const [comment, setComment] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [approveMutation, { loading: approving }] = useMutation(
    APPROVE_REQUEST_MUTATION,
    {
      onCompleted: () => setIsApproveModalOpen(false),
    },
  );
  const [rejectMutation, { loading: rejecting }] = useMutation(
    REJECT_REQUEST_MUTATION,
    {
      onCompleted: () => setIsRejectModalOpen(false),
    },
  );

  const isPending = status === "PENDING";
  const isLoading = approving || rejecting;

  const handleApprove = () => {
    approveMutation({
      variables: { input: { requestId, comment } },
    });
  };

  const handleReject = () => {
    rejectMutation({
      variables: { input: { requestId, comment } },
    });
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-4 font-heading">
        {t("managerAction")}
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="approval-comment"
            className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-2"
          >
            {t("comments")}
          </label>
          <Textarea
            id="approval-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("commentPlaceholder")}
            disabled={!isPending || isLoading}
            className="min-h-[100px] bg-surface-container-low border-surface-container-high"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setIsApproveModalOpen(true)}
            disabled={!isPending || isLoading}
            className="flex-1 bg-secondary text-on-secondary hover:bg-secondary/90 font-bold gap-2"
            size="xl"
          >
            <CheckCircle className="h-4 w-4" />
            {t("approve")}
          </Button>
          <Button
            onClick={() => setIsRejectModalOpen(true)}
            disabled={!isPending || isLoading}
            variant="destructive"
            className="flex-1 font-bold gap-2"
            size="xl"
          >
            <XCircle className="h-4 w-4" />
            {t("reject")}
          </Button>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-surface-container-lowest shadow-2xl rounded-xl">
          <div className="px-8 pt-8 pb-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-secondary w-8 h-8" />
            </div>
            <DialogHeader className="text-left p-0">
              <DialogTitle className="text-2xl font-headline font-extrabold text-primary tracking-tight mb-2">
                {t("approveRequestTitle")}
              </DialogTitle>
              <DialogDescription className="text-on-surface-variant leading-relaxed text-base font-medium">
                {t("approveRequestConfirmation")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 pb-8 flex flex-col gap-3">
            <Button
              type="button"
              className="w-full py-6 rounded-xl font-headline font-bold text-sm bg-secondary text-on-secondary shadow-lg shadow-secondary/20 h-auto flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              onClick={handleApprove}
              disabled={isLoading}
            >
              {approving ? t("loading") : t("confirmApprove")}
            </Button>
            <Button
              variant="ghost"
              className="w-full py-6 rounded-xl font-headline font-bold text-sm text-primary hover:bg-surface-container border border-outline-variant/30 h-auto transition-all active:scale-[0.98]"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-surface-container-lowest shadow-2xl rounded-xl">
          <div className="px-8 pt-8 pb-4">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="text-error w-8 h-8" />
            </div>
            <DialogHeader className="text-left p-0">
              <DialogTitle className="text-2xl font-headline font-extrabold text-primary tracking-tight mb-2">
                {t("rejectRequestTitle")}
              </DialogTitle>
              <DialogDescription className="text-on-surface-variant leading-relaxed text-base font-medium">
                {t("rejectRequestConfirmation")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 pb-8 flex flex-col gap-3">
            <Button
              type="button"
              variant="destructive"
              className="w-full py-6 rounded-xl font-headline font-bold text-sm shadow-lg shadow-error/20 h-auto flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              onClick={handleReject}
              disabled={isLoading}
            >
              <TriangleAlert className="w-5 h-5" />
              {rejecting ? t("loading") : t("confirmReject")}
            </Button>
            <Button
              variant="ghost"
              className="w-full py-6 rounded-xl font-headline font-bold text-sm text-primary hover:bg-surface-container border border-outline-variant/30 h-auto transition-all active:scale-[0.98]"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
