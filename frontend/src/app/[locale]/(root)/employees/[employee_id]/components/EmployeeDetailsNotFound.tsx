"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function EmployeeDetailsNotFound() {
  const employees = useTranslations("employees");

  return (
    <Card className="rounded-2xl border border-dashed border-outline-variant/20 bg-white/50 text-center">
      <CardHeader>
        <CardTitle className="text-xl font-black text-primary">
          {employees("notFoundTitle")}
        </CardTitle>
        <CardDescription>{employees("notFoundDescription")}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Link
          href="/employees"
          className={buttonVariants({ variant: "default" })}
        >
          {employees("backToDirectory")}
        </Link>
      </CardFooter>
    </Card>
  );
}
