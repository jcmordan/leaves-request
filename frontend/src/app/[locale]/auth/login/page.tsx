"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCard } from "./components/LoginCard";
import { MicrosoftSignInButton } from "./components/MicrosoftSignInButton";
import { LoginDivider } from "./components/LoginDivider";
import { CredentialsForm } from "./components/CredentialsForm";
import { LoginCardFooter } from "./components/LoginCardFooter";
import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations("Auth");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError(t("errorInvalidCredentials"));
    } else if (errorParam) {
      setError(t("errorGeneric"));
    }
  }, [searchParams, t]);

  const handleCredentialsSubmit = async (email: string, password: string) => {
    setError("");
    setIsLoading(true);

    try {
      await login("credentials", { username: email, password });
    } catch {
      setError(t("errorInvalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface geometric-bg">
      <main className="flex w-full grow items-center justify-center px-4">
        <LoginCard>
          <div className="p-10">
            <div className="mb-10 text-center">
              <Logo className="shadow-none" />
            </div>
            <MicrosoftSignInButton
              onClick={() => login("microsoft-entra-id")}
            />
            <LoginDivider />
            <CredentialsForm
              onSubmit={handleCredentialsSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <LoginCardFooter />
        </LoginCard>
      </main>
    </div>
  );
}
