import { InMemoryCache } from "@apollo/client-integration-nextjs";
import { relayStylePagination } from "@apollo/client/utilities";
import possibleTypes from "../../__generated__/possibleTypes";

/**
 * Constants and Default Options
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Registry of fields that require Relay Pagination merging logic.
 */
export const PAGINATED_FIELDS_REGISTRY = {
  employees: false,
  absenceRequests: false,
  absenceTypes: false,
  departments: false,
  teamAbsences: false,
} as const;

/**
 * Generates field policies for the Apollo cache based on the registry.
 */
export const generateFieldPolicies = (registry: Record<string, string[] | false>) => {
  return Object.entries(registry).reduce((acc, [fieldName, keyArgs]) => {
    acc[fieldName] = relayStylePagination(keyArgs);
    return acc;
  }, {} as any);
};

/**
 * Common Apollo cache configuration.
 */
export const getApolloCache = () => new InMemoryCache({
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
});

export const defaultFetchOptions = {
  next: { revalidate: 0 },
  credentials: "same-origin",
} as const;

export const defautApolloOptions: any = {
  query: {
    fetchPolicy: "cache-first",
    variables: {
      first: DEFAULT_PAGE_SIZE,
    },
  },
};
