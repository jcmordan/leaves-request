import { SetContextLink } from "@apollo/client/link/context";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { relayStylePagination } from "@apollo/client/utilities";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { auth } from "@/auth";
import { getApiUrl } from "../../envUtils";

import possibleTypes from "../__generated__/possibleTypes";

import { authErrorLink } from "./apollo-error-link";
import { HttpLink } from "@apollo/client";

export const DEFAULT_PAGE_SIZE = 5;

/**
 * Registry of fields that require Relay Pagination merging logic.
 * Set value to false to ignore all args (merge everything),
 * or an array of strings for specific filter arguments to key by.
 */
const PAGINATED_FIELDS_REGISTRY = {
  employees: false,
  absenceRequests: false,
  absenceTypes: false,
  departments: false,
} as const;

/**
 * Generates field policies for the Apollo cache based on the PAGINATED_FIELDS_REGISTRY.
 */
const generateFieldPolicies = (registry: Record<string, string[] | false>) => {
  return Object.entries(registry).reduce((acc, [fieldName, keyArgs]) => {
    acc[fieldName] = relayStylePagination(keyArgs);

    return acc;
  }, {} as any);
};

const defaultFetchOptions = {
  // Next.js-specific fetch options for caching and revalidation
  next: { revalidate: 0 }, // Set to 0 to avoid stale data hydration after mutations
  credentials: "same-origin",
} as const;

const defautApolloOptions: any = {
  query: {
    fetchPolicy: "cache-first",
    variables: {
      first: DEFAULT_PAGE_SIZE,
    },
  },
};

export const { getClient, query, PreloadQuery } = registerApolloClient(
  async () => {
    const session = await auth();
    const token = session?.accessToken;

    const uri =
      typeof window === "undefined" ? await getApiUrl() : "/api/graphql";

    console.log("uri", uri);

    return new ApolloClient({
      cache: new InMemoryCache({
        possibleTypes: possibleTypes.possibleTypes,
        typePolicies: {
          EmployeesConnection: {
            keyFields: [],
          },
          AbsenceRequestsConnection: {
            keyFields: [],
          },
          AbsenceTypesConnection: {
            keyFields: [],
          },
          DepartmentsConnection: {
            keyFields: [],
          },
          Query: {
            fields: {
              ...generateFieldPolicies(PAGINATED_FIELDS_REGISTRY),
            },
          },
        },
      }),
      link: authErrorLink.concat(
        new UploadHttpLink({
          uri,
          fetchOptions: defaultFetchOptions,
          headers: {
            authorization: token ? `Bearer ${token}` : "",
            "Apollo-Require-Preflight": "true",
          },
        }) as any,
      ),
      defaultOptions: defautApolloOptions,
    });
  },
);

export function createServerClient(accessToken?: string | null) {
  const isServer = typeof window === "undefined";

  const httpLink = new HttpLink({
    uri: isServer
      ? process.env.GRAPHQL_ENDPOINT || "http://localhost:5148/graphql/"
      : "/api/graphql",
    fetchOptions: defaultFetchOptions,
  });

  const authLink = new SetContextLink(
    (prevContext: Record<string, unknown>, _operation: unknown) => {
      const headers = prevContext.headers as Record<string, string> | undefined;

      return {
        headers: {
          ...headers,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Apollo-Require-Preflight": "true",
          authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      };
    },
  );

  return new ApolloClient({
    cache: new InMemoryCache({
      possibleTypes: possibleTypes.possibleTypes,
      typePolicies: {
        EmployeesConnection: {
          keyFields: [],
        },
        AbsenceRequestsConnection: {
          keyFields: [],
        },
        AbsenceTypesConnection: {
          keyFields: [],
        },
        DepartmentsConnection: {
          keyFields: [],
        },
        Query: {
          fields: {
            ...generateFieldPolicies(PAGINATED_FIELDS_REGISTRY),
          },
        },
      },
    }),
    link: authErrorLink.concat(authLink.concat(httpLink as any)),
    defaultOptions: defautApolloOptions,
  });
}
