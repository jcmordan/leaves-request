"use client";

import React from "react";
import { Search, LucideIcon, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  /**
   * Title of the empty state. Defaults to "No results found" (localized).
   */
  title?: React.ReactNode;
  /**
   * Description of the empty state. Defaults to "We couldn't find anything..." (localized).
   */
  description?: React.ReactNode;
  /**
   * Main icon displayed in the center. Defaults to Search (magnifying glass).
   */
  icon?: LucideIcon;
  /**
   * Optional secondary icon for a layered/silhouette effect.
   */
  secondaryIcon?: LucideIcon;
  /**
   * Optional primary action button.
   */
  action?: EmptyStateAction;
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
}

/**
 * A generic, premium empty state component with consistent styling and motion.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Search,
  secondaryIcon: SecondaryIcon,
  action,
  className,
}: EmptyStateProps) {
  const t = useTranslations("common");

  const ActionIcon = action?.icon ?? RotateCcw;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in-95 duration-500 bg-surface-container-lowest rounded-2xl border border-outline-variant/10",
        className
      )}
    >
      {/* Icon Container with Layered Background */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary/10 shadow-inner relative group">
        <div className="absolute inset-0 bg-secondary/5 rounded-3xl blur-xl group-hover:bg-secondary/10 transition-colors" />
        <div className="relative">
          <Icon className="h-12 w-12 text-secondary/60" strokeWidth={1.5} />
          {SecondaryIcon && (
            <div className="absolute inset-0 flex items-center justify-center pb-1">
              <SecondaryIcon className="h-5 w-5 text-secondary/40" />
            </div>
          )}
        </div>
      </div>

      {/* Text Content */}
      <h3 className="mb-3 text-2xl font-black text-primary tracking-tight font-heading">
        {title ?? t("noResultsTitle")}
      </h3>
      <p className="mb-10 max-w-sm text-base text-muted-foreground leading-relaxed">
        {description ?? t("noResultsDescription")}
      </p>

      {/* Action Button */}
      {action && (
        <Button
          variant="secondary"
          onClick={action.onClick}
          className="flex items-center gap-2 px-8 py-6 rounded-2xl h-auto text-base font-bold shadow-lg hover:shadow-secondary/20 transition-all active:scale-95 bg-secondary/10 text-secondary hover:bg-secondary/20 border-none"
        >
          <ActionIcon className="h-5 w-5" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
