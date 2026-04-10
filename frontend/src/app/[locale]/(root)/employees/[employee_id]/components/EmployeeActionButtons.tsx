"use client";

import { MessageSquare, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function EmployeeActionButtons() {
  const employees = useTranslations("employees");

  return (
    <section className="-mt-1 bg-surface-container-low px-4 pb-6">
      <div className="flex gap-3">
        <Button className="h-12 flex-1 rounded-xl bg-gradient-to-br from-primary to-primary-container font-semibold text-on-primary shadow-sm">
          <Pencil className="h-4 w-4" />
          {employees("editProfile")}
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex-1 rounded-xl bg-surface-container-highest font-semibold text-primary"
        >
          <MessageSquare className="h-4 w-4" />
          {employees("contact")}
        </Button>
      </div>
    </section>
  );
}
