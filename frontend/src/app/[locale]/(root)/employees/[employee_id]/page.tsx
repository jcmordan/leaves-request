import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LoadingCard from "@/components/card/LoadingCard";
import { PreloadQuery } from "@/lib/apollo-client";
import { EmployeeDetailsView } from "@/app/[locale]/(root)/employees/[employee_id]/components/EmployeeDetailsView";

import { EMPLOYEE_DETAILS_QUERY } from "./graphql/EmployeeDetailsQueries";

type PageProps = {
  params: Promise<{ locale: string; employee_id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; employee_id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Employees" });

  return {
    title: t("employeeDetails"),
  };
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
  const { employee_id } = await params;

  return (
    <PreloadQuery
      query={EMPLOYEE_DETAILS_QUERY}
      variables={{ id: employee_id }}
    >
      <Suspense fallback={<LoadingCard title="" subtitle="" description="" />}>
        <EmployeeDetailsView employeeId={employee_id} />
      </Suspense>
    </PreloadQuery>
  );
}
