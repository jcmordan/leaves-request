import { Suspense } from 'react'
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LoadingCard from '@/components/card/LoadingCard';
import { PreloadQuery } from '@/lib/apollo-client';
import { EmployeeDirectory } from "@/app/[locale]/(root)/employees/components/EmployeeDirectory";
import { EMPLOYEE_DIRECTORY_QUERY } from "./graphql/EmployeeQueries";

const PAGE_SIZE = 10;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ after?: string; before?: string; search?: string }>;
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "employees" });

  return {
    title: t('title'),
  };
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  const { after, before, search } = await searchParams;

  const variables = {
    ...(before
      ? { last: PAGE_SIZE, before }
      : { first: PAGE_SIZE, after: after ?? undefined }),
    search: search ?? undefined,
  };

  return (
    <PreloadQuery query={EMPLOYEE_DIRECTORY_QUERY} variables={variables}>
      <Suspense fallback={<LoadingCard title="" subtitle="" description="" />}>
        <EmployeeDirectory />
      </Suspense>
    </PreloadQuery>
  );
}
