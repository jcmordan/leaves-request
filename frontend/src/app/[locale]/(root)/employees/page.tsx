import { EmployeeDirectory } from "@/components/employees/EmployeeDirectory";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Employees' });

  return {
    title: t('title'),
  };
}

export default function EmployeesPage() {
  return <EmployeeDirectory />;
}
