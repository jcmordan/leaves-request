"use client";

import { useTranslations } from "next-intl";
import { Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale } from "next-intl";

interface TeamCalendarHeaderProps {
  onNewRequest: () => void;
}

export function TeamCalendarHeader({ onNewRequest }: TeamCalendarHeaderProps) {
  const t = useTranslations("team");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const currentPeriod = format(new Date(), "MMMM yyyy", { locale: dateLocale });

  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("subtitle", { period: currentPeriod })}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 bg-surface-container-lowest text-primary font-bold rounded-lg flex items-center space-x-2 border-none shadow-sm hover:bg-surface-container transition-colors">
          <Filter className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">{t("filters")}</span>
        </button>
        <button
          onClick={onNewRequest}
          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg flex items-center space-x-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">{t("newRequest")}</span>
        </button>
      </div>
    </div>
  );
}
