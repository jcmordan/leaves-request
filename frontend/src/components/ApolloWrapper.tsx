"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { makeClient } from "@/lib/makeClient";

/**
 * Apollo Wrapper component for Client Components.
 * Sets up the Apollo Client with the user's access token.
 */
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const makeClientWithToken = useCallback(() => {
    return makeClient(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/", redirect: true }).catch(() => {
        // Handle sign-out error silently
      });
    }
  }, [session]);

  return (
    <ApolloNextAppProvider key={accessToken} makeClient={makeClientWithToken}>
      {children}
    </ApolloNextAppProvider>
  );
}
