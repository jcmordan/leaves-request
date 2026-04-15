"use client";

import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface CredentialsFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

/**
 * Email/password credential form with inline error display.
 * Refactored to use react-hook-form and shared form components.
 */
export function CredentialsForm({
  onSubmit,
  isLoading,
  error,
}: CredentialsFormProps) {
  const t = useTranslations("auth");

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onFormSubmit = async (data: LoginFormValues) => {
    await onSubmit(data.email, data.password);
  };

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit(onFormSubmit)}
        noValidate
      >
        <FormTextInput
          name="email"
          label={t("emailLabel")}
          type="email"
          placeholder="usuario@refidomsa.com.do"
          variant="refined"
          required
        />

        <div className="relative group/field">
          <div className="absolute right-1 top-0 z-10 transition-opacity">
            <a
              href="#"
              className="text-[10px] font-bold uppercase tracking-[0.08em] text-surface-tint hover:underline"
            >
              {t("forgotPassword")}
            </a>
          </div>
          <FormTextInput
            name="password"
            label={t("passwordLabel")}
            type="password"
            placeholder="contraseña"
            variant="refined"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/15 bg-destructive/5 mb-8 p-4 text-sm font-medium text-destructive transition-all animate-in fade-in slide-in-from-top-2">
            <CircleAlert className="h-5 w-5 shrink-0 opacity-80" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-14 rounded-xl text-base font-black tracking-tight transition-all duration-300",
            "bg-surface-container-highest text-primary hover:bg-surface-container-high active:scale-[0.98]",
            "shadow-sm hover:shadow-md disabled:opacity-50",
          )}
        >
          {isLoading ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </FormProvider>
  );
}
