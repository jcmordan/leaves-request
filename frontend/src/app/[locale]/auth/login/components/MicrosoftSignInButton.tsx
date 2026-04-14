import { useTranslations } from "next-intl";

interface MicrosoftSignInButtonProps {
  onClick: () => void;
}

const MicrosoftLogo = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 23 23"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h23v23H0z" fill="#f3f3f3" />
    <path d="M1 1h10v10H1z" fill="#f35325" />
    <path d="M12 1h10v10H12z" fill="#81bc06" />
    <path d="M1 12h10v10H1z" fill="#05a6f0" />
    <path d="M12 12h10v10H12z" fill="#ffba08" />
  </svg>
);

/**
 * Button that triggers Microsoft Entra ID sign-in flow.
 */
export function MicrosoftSignInButton({ onClick }: MicrosoftSignInButtonProps) {
  const t = useTranslations("auth");

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-center gap-3 rounded-lg bg-surface-container-high px-6 py-4 transition-all duration-200 hover:bg-surface-container-highest"
    >
      <MicrosoftLogo />
      <span className="font-semibold text-primary">{t("microsoftSignIn")}</span>
    </button>
  );
}
