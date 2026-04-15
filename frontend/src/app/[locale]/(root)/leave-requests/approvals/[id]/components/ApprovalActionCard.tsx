"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  const [approveMutation, { loading: approving }] = useMutation(
    APPROVE_REQUEST_MUTATION,
  );
  const [rejectMutation, { loading: rejecting }] = useMutation(
    REJECT_REQUEST_MUTATION,
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
            onClick={handleApprove}
            disabled={!isPending || isLoading}
            className="flex-1 bg-secondary text-on-secondary hover:bg-secondary/90 font-bold gap-2"
            size="xl"
          >
            <CheckCircle className="h-4 w-4" />
            {t("approve")}
          </Button>
          <Button
            onClick={handleReject}
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
    </section>
  );
}
