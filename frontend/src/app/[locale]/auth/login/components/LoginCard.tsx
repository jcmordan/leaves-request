import { ReactNode } from "react";

interface LoginCardProps {
  children: ReactNode;
}

/**
 * White card container with ambient shadow used on the login page.
 */
export function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient">
      {children}
    </div>
  );
}
