import { useTranslations } from "next-intl";

export function LoginDivider() {
  const t = useTranslations("auth");

  return (
    <div className="relative my-8 flex items-center">
      <div className="h-px grow bg-outline-variant opacity-20" />
      <span className="bg-surface-container-lowest px-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {t("dividerOr")}
      </span>
      <div className="h-px grow bg-outline-variant opacity-20" />
    </div>
  );
}
