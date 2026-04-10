"use client";

import { Activity, Star, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EmployeeUpcomingEventsCard() {
  const employees = useTranslations("employees");

  const events = [
    {
      id: 1,
      title: "Annual Performance Review",
      date: "Oct 24, 2024",
      type: "Review",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Department Townhall",
      date: "Mar 12, 2024",
      type: "Meeting",
      status: "Scheduled",
    },
  ];

  return (
    <Card className="border-none bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          Upcoming Events
        </h3>
        <Activity className="h-5 w-5 text-tertiary/50" />
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="group relative rounded-2xl bg-surface-container-low/40 p-4 transition-all hover:bg-surface-container-low"
          >
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full bg-secondary/10 text-[10px] font-bold text-secondary">
                {event.type}
              </Badge>
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                {event.date}
              </div>
            </div>
            <p className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">
              {event.title}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-primary/5 p-4 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
             <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-sm font-black text-primary">Star Performer</p>
            <p className="text-[11px] font-bold text-primary/60 uppercase tracking-wider">Top 5% of Q1 2024</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
