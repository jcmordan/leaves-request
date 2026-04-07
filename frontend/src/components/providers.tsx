"use client";

import { ApolloProvider } from '@apollo/client/react';
import { client } from '@/lib/apollo-client';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApolloProvider>
  );
}
