"use client";

import { Info, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { REQUEST_DETAIL_FRAGMENT } from "../graphql/RequestDetailsQueries";

interface AdditionalInfoSectionProps {
  requestRef: FragmentType<typeof REQUEST_DETAIL_FRAGMENT>;
}

/**
 * AdditionalInfoSection Component
 * Displays employee comments (reason) and coverage status.
 * Aligned with Refidomsa Architectural Minimalist design system.
 */
export function AdditionalInfoSection({
  requestRef,
}: AdditionalInfoSectionProps) {
  const t = useTranslations("requests");
  const request = useFragment(REQUEST_DETAIL_FRAGMENT, requestRef);

  return (
    <div className="content-card p-8 flex flex-col h-full animate-in fade-in duration-500 delay-150">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary shadow-ambient">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary font-heading">
            {t("additionalInfoTitle")}
          </h3>
        </div>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <p className="label-sm mb-3">
            {t("employeeComment")}
          </p>
          <div className="relative">
            <span className="absolute -left-3 top-0 text-2xl text-primary/10 font-serif">"</span>
            <p className="text-sm italic text-on-surface-variant leading-relaxed px-1">
              {request.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
