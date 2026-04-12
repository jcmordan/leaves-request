"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface IDateRangePickerProps {
  range?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  locale?: string;
}

export function DateRangePicker({
  range,
  onRangeChange,
  placeholder,
  disabled,
  className,
  id,
  locale: localeProp,
}: IDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentLocale = useLocale() as "en" | "es";
  const locale = localeProp ?? currentLocale;
  const t = useTranslations("forms.datePicker");
  const defaultPlaceholder = placeholder ?? t("placeholder");

  const dateLocale = locale === "es" ? es : enUS;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !range && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "LLL dd, y", { locale: dateLocale })} -{" "}
                    {format(range.to, "LLL dd, y", { locale: dateLocale })}
                  </>
                ) : (
                  format(range.from, "LLL dd, y", { locale: dateLocale })
                )
              ) : (
                <span>{defaultPlaceholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={1}
            captionLayout="dropdown"
            locale={dateLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
