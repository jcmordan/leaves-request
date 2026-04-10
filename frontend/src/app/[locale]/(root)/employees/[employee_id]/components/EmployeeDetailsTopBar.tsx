"use client";

import { ArrowLeft, EllipsisVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";

export function EmployeeDetailsTopBar() {
  const employees = useTranslations("employees");

  return (
    <header className="flex h-20 items-center justify-between bg-surface px-8 pt-4">
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          {employees("employeeManagement")}
        </h1>
        <div className="ml-10 flex items-center gap-8">
          <Link
            href="/employees"
            className="border-b-2 border-secondary pb-1 text-sm font-bold text-primary"
          >
            {employees("directory")}
          </Link>
          <button className="pb-1 text-sm font-medium text-muted-foreground hover:text-primary">
            {employees("orgChart")}
          </button>
          <button className="pb-1 text-sm font-medium text-muted-foreground hover:text-primary">
            {employees("reports")}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Search directory...
          </span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="h-8 w-8 rounded-full bg-surface-container-high" />
        </Button>
      </div>
    </header>
  );
}
