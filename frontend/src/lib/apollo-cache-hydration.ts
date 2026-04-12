"use client";

import { ApolloClient, type DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useRef } from "react";

import { logger } from "./logger";

const getLog = () => logger.child({ module: "apollo-cache-hydration" });

/**
 * Hydrates Apollo cache with server-fetched data
 * This eliminates the need for prop drilling initialData
 */
export function hydrateCache<TData>(
  client: ApolloClient,
  query: DocumentNode,
  data: TData,
  variables?: Record<string, unknown>,
): void {
  try {
    client.writeQuery({
      query,
      data,
      variables,
    });
  } catch (error) {
    // If cache write fails, log but don't throw
    // The component will still work with the data passed as prop
    getLog().error({ error }, "Failed to hydrate Apollo cache");
  }
}

interface ApolloCacheHydratorProps<TData> {
  query: DocumentNode;
  data: TData | undefined;
  variables?: Record<string, unknown>;
}

/**
 * Client component that hydrates the Apollo cache with provided data
 */
export function ApolloCacheHydrator<TData>({
  query,
  data,
  variables,
}: ApolloCacheHydratorProps<TData>) {
  const client = useApolloClient();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (data && !hasHydrated.current) {
      getLog().debug("Hydrating Apollo cache from server data");
      hydrateCache(client, query, data, variables);
      hasHydrated.current = true;
    }
  }, [client, query, data, variables]);

  return null;
}
