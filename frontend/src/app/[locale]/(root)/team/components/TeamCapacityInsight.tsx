"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

interface TeamCapacityInsightProps {
  message: string | null | undefined;
}

export function TeamCapacityInsight({ message }: TeamCapacityInsightProps) {
  const t = useTranslations("team");

  if (!message) return null;

  return (
    <div className="flex items-center space-x-4 bg-secondary-container/30 p-4 rounded-xl border border-secondary/10">
      <Info className="h-5 w-5 text-secondary shrink-0" />
      <p className="text-sm text-on-secondary-container leading-relaxed">
        <span className="font-extrabold uppercase tracking-widest mr-2">{t("proTip")}:</span>
        {message}
      </p>
    </div>
  );
}
