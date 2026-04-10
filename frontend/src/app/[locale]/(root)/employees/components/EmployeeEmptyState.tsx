"use client";

import React from "react";
import { Search, User, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface EmployeeEmptyStateProps {
  onClearSearch?: () => void;
}

/**
 * EmployeeEmptyState is displayed when the employee list is empty.
 * It provides visual feedback and an optional action to clear filters.
 */
export function EmployeeEmptyState({ onClearSearch }: EmployeeEmptyStateProps) {
  const t = useTranslations("employees");

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in-95 duration-500 bg-white rounded-2xl">
      {/* Search Icon with User Silhouette */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary/10 shadow-inner relative group">
        <div className="absolute inset-0 bg-secondary/5 rounded-3xl blur-xl group-hover:bg-secondary/10 transition-colors" />
        <div className="relative">
          <Search className="h-12 w-12 text-secondary/60" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center pb-1">
            <User className="h-5 w-5 text-secondary/40" />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <h3 className="mb-3 text-2xl font-black text-primary tracking-tight font-heading">
        {t("emptyStateTitle")}
      </h3>
      <p className="mb-10 max-w-sm text-base text-muted-foreground leading-relaxed">
        {t("emptyStateDescription")}
      </p>

      {/* Action Button */}
      {onClearSearch && (
        <Button
          variant="secondary"
          onClick={onClearSearch}
          className="flex items-center gap-2 px-8 py-6 rounded-2xl h-auto text-base font-bold shadow-lg hover:shadow-secondary/20 transition-all active:scale-95 bg-secondary/10 text-secondary hover:bg-secondary/20 border-none"
        >
          <RotateCcw className="h-5 w-5" />
          {t("clearSearch")}
        </Button>
      )}
    </div>
  );
}
