"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FilterSearchInput } from "@/components/filters/FilterSearchInput";

interface DirectoryControlsProps {
  onSearch: (query: string) => void;
  searchValue?: string;
}

export function DirectoryControls({
  onSearch,
  searchValue,
}: DirectoryControlsProps) {
  const t = useTranslations("Employees");
  const [query, setQuery] = useState(searchValue ?? "");

  useEffect(() => {
    setQuery(searchValue ?? "");
  }, [searchValue]);

  const handleQueryChange = (val?: string) => {
    const newVal = val ?? query;
    setQuery(newVal);
    onSearch(newVal);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <FilterSearchInput
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={handleQueryChange}
        onSearch={handleQueryChange}
        className="flex-1 h-14"
      />

      <div className="flex gap-4">
        <Button
          variant="default"
          className="h-14 px-8 gap-2 bg-primary shadow-lg shadow-primary/20 transition-all rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          <Plus className="h-5 w-5" />
          {t("newEmployee")}
        </Button>
      </div>
    </div>
  );
}
