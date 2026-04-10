"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSuspenseQuery } from "@apollo/client/react";
import { useDebouncedCallback } from "use-debounce";

import { useUrlPagination } from "@/hooks/useUrlPagination";

import { StatsSection } from "./StatsSection";
import { DirectoryControls } from "./DirectoryControls";
import { EmployeeTable } from "./EmployeeTable";
import { EMPLOYEE_DIRECTORY_QUERY } from "../graphql/EmployeeQueries";

const PAGE_SIZE = 10;

export function EmployeeDirectory() {
  const t = useTranslations("employees");
  const searchParams = useSearchParams();
  const { setFilter } = useUrlPagination();

  const after = searchParams.get("after") ?? undefined;
  const before = searchParams.get("before") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const variables = {
    ...(before
      ? { last: PAGE_SIZE, before }
      : { first: PAGE_SIZE, after: after ?? undefined }),
    search,
  };

  const { data } = useSuspenseQuery(EMPLOYEE_DIRECTORY_QUERY, { variables });

  const handleSearch = useDebouncedCallback((value: string) => {
    setFilter("search", value);
  }, 500);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-primary tracking-tight font-heading mb-2">
          {t("title")}
        </h1>
        <div className="h-1 w-20 bg-secondary rounded-full shadow-[0_0_12px_rgba(var(--secondary-rgb),0.3)]" />
      </div>

      {/* Stats Overview */}
      <StatsSection statsQueryRef={data} />

      {/* Main Content Area */}
      <div className="space-y-6">
        <DirectoryControls onSearch={handleSearch} searchValue={search} />

        <div className="relative">
          <EmployeeTable
            employeesRef={data.employees}
            variables={variables}
            onClearSearch={() => setFilter("search", "")}
          />

          {/* Floating Action Button (Mobile optimization / quick access) */}
          <button className="fixed bottom-10 right-10 h-16 w-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden z-50">
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
