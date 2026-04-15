"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export type Role =
  | "Admin"
  | "HRManager"
  | "Manager"
  | "Employee"
  | "Supervisor"
  | "HR_Admin"
  | "Coordinator";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    provider?: string,
    credentials?: Record<string, string>,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user: User | null = session?.user
    ? {
        id: session.oid || session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        roles: (session.user.roles as Role[]) || ["Employee"],
      }
    : null;

  const login = async (
    provider: string = "microsoft-entra-id",
    credentials?: Record<string, string>,
  ) => {
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    await signIn(provider, { ...credentials, callbackUrl });
  };

  const logout = async () => {
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  const contextValue: AuthContextType = {
    user,
    token: session?.accessToken || null,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
