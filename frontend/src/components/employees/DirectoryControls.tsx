"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface DirectoryControlsProps {
  onSearch: (query: string) => void;
}

export function DirectoryControls({ onSearch }: DirectoryControlsProps) {
  const t = useTranslations("Employees");
  const c = useTranslations("Common");

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder={t("searchPlaceholder")}
          className="pl-12 h-14 bg-white/70 backdrop-blur-sm border-none shadow-sm text-base placeholder:text-muted-foreground/60 transition-all focus:ring-2 focus:ring-primary/20"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="h-14 px-6 gap-2 bg-white/70 backdrop-blur-sm border-none shadow-sm text-xs font-bold uppercase tracking-widest hover:bg-white"
        >
          <ListFilter className="h-5 w-5 text-muted-foreground" />
          {c("filters")}
        </Button>
        <Button 
          className="h-14 px-8 gap-2 bg-primary shadow-[0_8px_16px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_12px_24px_rgba(var(--primary-rgb),0.3)] transition-all rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          <Plus className="h-5 w-5" />
          {t("newEmployee")}
        </Button>
      </div>
    </div>
  );
}
