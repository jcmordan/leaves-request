"use client";

import { ApolloWrapper } from "./ApolloWrapper";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ApolloWrapper>
        <AuthProvider>{children}</AuthProvider>
      </ApolloWrapper>
    </SessionProvider>
  );
}
