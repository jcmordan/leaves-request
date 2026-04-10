"use client";

import { ApolloWrapper } from "./ApolloWrapper";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SheetProvider } from "./layout/sheets/SheetNavigation";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ApolloWrapper>
        <AuthProvider>
          <SheetProvider>{children}</SheetProvider>
        </AuthProvider>
      </ApolloWrapper>
    </SessionProvider>
  );
}
