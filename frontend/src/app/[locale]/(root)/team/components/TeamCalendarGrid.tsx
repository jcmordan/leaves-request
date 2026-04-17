"use client";

import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  type: string;
  employeeName: string;
  duration: number;
  allDay?: boolean;
}

interface TeamCalendarGridProps {
  events: CalendarEvent[];
}

export function TeamCalendarGrid({ events }: TeamCalendarGridProps) {
  const locale = useLocale();
  const t = useTranslations("team");
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const eventPropGetter = (event: CalendarEvent) => {
    const isPending = event.status === "PENDING";
    return {
      className: `!border-none !rounded-xl !px-3 !py-2 !transition-all hover:!opacity-95 shadow-sm ${
        isPending
          ? "!bg-amber-50 !text-amber-800 !border-l-[6px] !border-amber-400"
          : "!bg-secondary/5 !text-secondary !border-l-[6px] !border-secondary"
      }`,
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="text-[11px] font-black uppercase tracking-tight truncate leading-tight">
        {event.employeeName}
      </div>
      <div className="text-[9px] font-bold opacity-70 uppercase tracking-widest truncate leading-tight">
        {event.type}
      </div>
      {/* <div className="text-[8px] font-medium opacity-50 uppercase tracking-widest mt-0.5">
        {t("daysCount", { count: event.duration })}
      </div> */}
    </div>
  );

  const components = useMemo(
    () => ({
      toolbar: (props: any) => (
        <div className="p-6 flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center space-x-6">
            <h2 className="text-xl font-extrabold text-primary">
              {format(props.date, "MMMM yyyy", {
                locale: locale === "es" ? es : enUS,
              })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => props.onNavigate("PREV")}
                className="p-1 rounded-md hover:bg-surface-container transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => props.onNavigate("NEXT")}
                className="p-1 rounded-md hover:bg-surface-container transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={() => props.onNavigate("TODAY")}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
            >
              {t("today")}
            </button>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            {[
              { id: Views.MONTH, label: t("month") },
              { id: Views.WEEK, label: t("week") },
              { id: Views.AGENDA, label: t("timeline") },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => props.onView(v.id)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                  props.view === v.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      ),
    }),
    [locale, t]
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col h-[800px]">
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-month-view { border: none !important; }
        .rbc-month-row { border-top: 1px solid var(--color-surface-container) !important; }
        .rbc-day-bg { border-left: 1px solid var(--color-surface-container) !important; }
        .rbc-day-bg:first-of-type { border-left: none !important; }
        .rbc-header { 
          border-bottom: 1px solid var(--color-surface-container) !important;
          border-left: 1px solid var(--color-surface-container) !important;
          padding: 12px 0 !important;
          background-color: var(--color-surface-container-low) !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          color: var(--color-muted-foreground) !important;
        }
        .rbc-header:first-of-type { border-left: none !important; }
        .rbc-off-range-bg { background-color: rgba(205, 219, 242, 0.1) !important; }
        .rbc-today { background-color: var(--color-surface-container-low) !important; }
        .rbc-event { 
          padding: 0 !important; 
          margin: 4px 2px !important; 
          min-height: 52px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .rbc-time-view {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
          height: 100% !important;
          border: none !important;
        }
        .rbc-time-header {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          margin-right: 0 !important;
        }
        .rbc-time-header-content {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          border-left: 1px solid var(--color-surface-container) !important;
        }
        .rbc-allday-cell {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .rbc-row-content {
          flex: 1 !important;
        }
        .rbc-time-view .rbc-allday-cell {
          padding-bottom: 20px !important;
        }
        .rbc-time-content {
          display: none !important;
        }
        .rbc-event-content { padding: 0 !important; flex: 1; }
        .rbc-show-more { font-size: 9px !important; font-weight: 700 !important; color: var(--color-primary) !important; }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={{
          ...components,
          event: CustomEvent,
        }}
        eventPropGetter={eventPropGetter}
        allDayAccessor="allDay"
        className="flex-1"
        messages={{
          allDay: t("allDay"),
          previous: t("previous"),
          next: t("next"),
          today: t("today"),
          month: t("month"),
          week: t("week"),
          day: t("day"),
          agenda: t("timeline"),
          date: t("date"),
          time: t("time"),
          event: t("event"),
          noEventsInRange: t("noEventsInRange"),
          showMore: (total) => t("showMore", { count: total }),
        }}
      />
    </div>
  );
}
