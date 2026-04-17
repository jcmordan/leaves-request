"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Props for DashboardInfoTooltip Component.
 */
interface DashboardInfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  variant?: "default" | "subtle";
}

/**
 * DashboardInfoTooltip — A reusable question mark icon that triggers an explanatory tooltip.
 * Designed specifically for dashboard card headers.
 */
export function DashboardInfoTooltip({
  content,
  className,
  iconClassName,
  variant = "default",
}: DashboardInfoTooltipProps) {
  const t = useTranslations("requests");
  const isSubtle = variant === "subtle";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-0.5 hover:bg-surface-container transition-all focus:outline-hidden group",
            className,
          )}
          aria-label={t("moreInformation")}
        >
          <HelpCircle
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isSubtle
                ? "text-on-surface-variant/10 group-hover:text-on-surface-variant/40"
                : "text-on-surface-variant/30 group-hover:text-primary",
              iconClassName,
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="bg-surface-container text-on-surface font-body text-[10px] font-bold py-1.5 px-3 rounded-md shadow-lg border-none max-w-xs animate-in zoom-in-95 duration-200"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
