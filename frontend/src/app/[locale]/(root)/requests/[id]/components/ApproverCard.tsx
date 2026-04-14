"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FragmentType, useFragment } from "@/__generated__";
import { REQUEST_DETAIL_FRAGMENT } from "../graphql/RequestDetailsQueries";
import { getInitials } from "@/utils/formatters";

interface ApproverCardProps {
  requestRef: FragmentType<typeof REQUEST_DETAIL_FRAGMENT>;
}

/**
 * ApproverCard Component
 * Displays the current assigned approver in a premium dark card.
 * Aligned with Refidomsa Architectural Minimalist design system.
 */
export function ApproverCard({ requestRef }: ApproverCardProps) {
  const t = useTranslations("requests");
  const request = useFragment(REQUEST_DETAIL_FRAGMENT, requestRef);
  
  // For the demo/design alignment, we use the requester's manager as the "Current Approver"
  // In a real system, this would come from a specific 'currentApprover' field.
  const approver = request.employee?.manager;

  if (!approver) {
    return null; // Don't show if no approver is assigned
  }

  return (
    <div className="bg-[#001430] text-white rounded-lg p-8 shadow-ambient space-y-8 animate-in slide-in-from-right duration-500">
      <div className="space-y-1">
        <p className="label-sm text-white/50 tracking-[0.12em]">
          {t("currentApprover")}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-secondary/40 animate-pulse" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-4xl font-black text-white shadow-xl">
            {getInitials(approver.fullName)}
          </div>
         
        </div>
        <div className="space-y-1">
          <h3 className="headline-md text-white leading-tight">
            {approver.fullName}
          </h3>
          <p className="text-xs text-white/60 font-medium">
            {approver.jobTitle?.name ?? "Lead"}
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex items-end justify-between">
        <div className="space-y-2">
          <p className="label-sm text-white/40">{t("responseTime")}</p>
          <p className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            TYPICALLY &lt; 2 HRS
          </p>
        </div>
      </div>
    </div>
  );
}
