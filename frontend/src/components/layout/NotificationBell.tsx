"use client";

import { BadgeAlertIcon, Bell, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePendingActions } from "@/contexts/PendingActionsContext";
import { cn } from "@/lib/utils";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "../ui/item";

export const NotificationBell = () => {
  const { state, dismissAction } = usePendingActions();
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");

  const notifications = useMemo(
    () =>
      Object.entries(state).flatMap(([module, actions]) =>
        actions
          .filter((a) => !a.dismissed)
          .map((action) => {
            const patientName =
              action.metadata["PatientName"] || "Unknown Patient";
            const scheduledTime =
              action.metadata["ScheduledStartTime"] || action.createdAt;
            const isOverdue = action.type === "OVERDUE";

            // Reconstruct basic generic description if not present, or use what's there
            // Note: The hook mapped it with specific keys. Ideally we trust action.description
            // But we might need module-specific translations if they aren't baked in?
            // actions from hook already have localized title/description from hook's `t`.
            // So we can use them directly.

            return {
              id: action.id,
              title: patientName ?? action.title + action.type,
              description: action.description,
              time: new Date(scheduledTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isUrgent: isOverdue,
              href: action.href,
              metadata: action.metadata,
              module, // Keep track of module for dismissal
            };
          }),
      ),
    [state],
  );

  const count = notifications.length;

  const handleDismiss = (id: string, module: string) => {
    // We need the module to dismiss.
    // We embedded it in the map above.
    dismissAction(module as any, id); // Casting module type if needed or fix strictness
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            suppressHydrationWarning
          >
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-100 p-0" align="end">
        <div className="p-4 font-medium leading-none">
          Notifications ({count})
        </div>
        <Separator />
        <ScrollArea className="h-72">
          {count === 0 ? (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((notification) => (
                <Item
                  key={notification.id}
                  className={cn(
                    notification.isUrgent &&
                      "bg-red-50 hover:bg-red-100/50 border rounded-none",
                    "pb-0",
                  )}
                >
                  <Activity mode={notification.isUrgent ? "visible" : "hidden"}>
                    <ItemMedia>
                      <BadgeAlertIcon className="size-5" />
                    </ItemMedia>
                  </Activity>
                  <ItemContent className="pb-4">
                    <ItemHeader>
                      <ItemTitle>{notification.title}</ItemTitle>
                      <ItemActions>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleDismiss(notification.id, notification.module)
                          }
                        >
                          <X className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Dismiss</span>
                        </Button>
                      </ItemActions>
                    </ItemHeader>
                    <ItemDescription className="text-sm text-muted-foreground flex flex-col gap-1">
                      <span>{notification.description}</span>
                      <Activity mode={notification.href ? "visible" : "hidden"}>
                        <Link
                          href={notification.href ?? ""}
                          className="text-sm text-primary flex-1"
                        >
                          {t("viewNotification")}
                        </Link>
                      </Activity>
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
