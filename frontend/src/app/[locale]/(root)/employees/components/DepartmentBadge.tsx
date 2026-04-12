"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const departmentColorMap: Record<string, string> = {
  engineering: "bg-blue-50 text-blue-700 border-blue-100",
  management: "bg-slate-50 text-slate-700 border-slate-100",
  legal: "bg-indigo-50 text-indigo-700 border-indigo-100",
  humanResources: "bg-rose-50 text-rose-700 border-rose-100",
  operations: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function DepartmentBadge({ department }: { department: string }) {
  const t = useTranslations("Departments");

  // Normalize key to camelCase for lookup
  const key =
    department.charAt(0).toLowerCase() +
    department.slice(1).replace(/\s+/g, "");
  const colors =
    departmentColorMap[key] || "bg-gray-50 text-gray-700 border-gray-100";

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded-full",
        colors,
      )}
    >
      {t(key, { default: department })}
    </Badge>
  );
}
